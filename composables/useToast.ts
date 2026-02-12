export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const TOAST_DURATION = 3000;

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => []);

  function showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const toastId = crypto.randomUUID();
    toasts.value.push({ id: toastId, message, type });

    setTimeout(() => {
      removeToast(toastId);
    }, TOAST_DURATION);
  }

  function removeToast(id: string): void {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  }

  return {
    toasts,
    showToast,
    removeToast,
  };
}
