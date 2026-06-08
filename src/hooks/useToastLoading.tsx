import { useRef } from 'react';
import {
  toast as toastify,
  type Id,
  type ToastContent,
  type TypeOptions,
} from 'react-toastify';

type ToastType = TypeOptions | 'loading' | 'dismiss';

type ToastLoadingProp = {
  message?: string;
  type?: ToastType;
  isLoading?: boolean;
  onClose?: () => void;
};

type UseToastProp = (prop: ToastLoadingProp) => void;

function renderMessage(message?: string): ToastContent | undefined {
  if (!message) return undefined;
  return <div dangerouslySetInnerHTML={{ __html: message }} />;
}

export default function useToastLoading(): UseToastProp {
  const toastRef = useRef<Id | null>(null);

  function toast(props: ToastLoadingProp) {
    const message = renderMessage(props.message);

    if (!props.type || props.type === 'loading') {
      toastRef.current = toastify.loading(message);
      return;
    }

    if (props.type === 'dismiss') {
      toastify.dismiss(toastRef.current ?? undefined);
      toastRef.current = null;
      return;
    }

    if (toastRef.current) {
      toastify.update(toastRef.current, {
        render: message,
        type: props.type,
        autoClose: 5000,
        isLoading: false,
        closeButton: true,
      });
      if (props.onClose) setTimeout(props.onClose, 50);
      return;
    }

    toastify(message, { type: props.type });
  }

  return toast;
}
