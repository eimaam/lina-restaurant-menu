import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { UserRole } from '../types';
import { logAudit } from '../services/audit.service';

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email and password are required.' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(409).json({ success: false, message: 'User with this email already exists.' });
      return;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim(),
      role: role && Object.values(UserRole).includes(role) ? role : UserRole.Staff,
      isActive: true,
    });

    await logAudit(req, {
      action: 'create',
      resource: 'User',
      resourceId: user._id.toString(),
      description: `Created new staff account for "${user.name}" (${user.email}) with role ${user.role}.`,
      details: { name: user.name, email: user.email, role: user.role, phone: user.phone },
    });

    const sanitized = await User.findById(user._id).select('-password');
    res.status(201).json({
      success: true,
      data: sanitized,
      message: 'Staff user account created successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.password = newPassword;
    await user.save();

    await logAudit(req, {
      action: 'reset_password',
      resource: 'User',
      resourceId: user._id.toString(),
      description: `Reset password for user "${user.name}" (${user.email}).`,
      details: { email: user.email, role: user.role },
    });

    res.json({ success: true, message: 'User password reset successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    await logAudit(req, {
      action: user.isActive ? 'activate' : 'deactivate',
      resource: 'User',
      resourceId: user._id.toString(),
      description: `${user.isActive ? 'Activated' : 'Deactivated'} user account "${user.name}" (${user.email}).`,
      details: { email: user.email, role: user.role, isActive: user.isActive },
    });

    res.json({
      success: true,
      data: { id: user._id, isActive: user.isActive },
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.isActive = false;
    await user.save();

    await logAudit(req, {
      action: 'delete',
      resource: 'User',
      resourceId: user._id.toString(),
      description: `Deactivated and removed user "${user.name}" (${user.email}) from active directory.`,
      details: { email: user.email, role: user.role },
    });

    res.json({
      success: true,
      message: 'Staff user account deactivated and safely removed from active directory.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
