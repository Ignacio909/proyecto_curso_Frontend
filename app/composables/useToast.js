export const useToast = () => {
    const toasts = useState('toasts', () => [])

    const addToast = (message, type = 'success') => {
        const id = Date.now()
        toasts.value.push({ id, message, type })

        setTimeout(() => {
            removeToast(id)
        }, 3000)
    }

    const removeToast = (id) => {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    return {
        toasts,
        addToast,
        removeToast
    }
}
