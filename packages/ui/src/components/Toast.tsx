import { message } from 'antd';

export const toast = {
  success: (content: string) => {
    message.success({
      content,
      style: { marginTop: '20px' },
    });
  },
  error: (content: string) => {
    message.error({
      content,
      style: { marginTop: '20px' },
    });
  },
  info: (content: string) => {
    message.info({
      content,
      style: { marginTop: '20px' },
    });
  },
  warning: (content: string) => {
    message.warning({
      content,
      style: { marginTop: '20px' },
    });
  },
};
