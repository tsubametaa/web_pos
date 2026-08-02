import type { ToastMessage } from '../../types';

class ToastStore {
	messages = $state<ToastMessage[]>([]);

	show(message: string, type: ToastMessage['type'] = 'info', duration = 3000) {
		const id = Math.random().toString(36).substring(2, 9);
		const toastItem: ToastMessage = { id, message, type, duration };
		this.messages.push(toastItem);

		setTimeout(() => {
			this.dismiss(id);
		}, duration);
	}

	success(message: string, duration = 3000) {
		this.show(message, 'success', duration);
	}

	error(message: string, duration = 4000) {
		this.show(message, 'error', duration);
	}

	warning(message: string, duration = 3500) {
		this.show(message, 'warning', duration);
	}

	info(message: string, duration = 3000) {
		this.show(message, 'info', duration);
	}

	dismiss(id: string) {
		this.messages = this.messages.filter((m) => m.id !== id);
	}
}

export const toast = new ToastStore();
