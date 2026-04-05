export const UserService = {
    login(username, password) {
        let userRole = 'user';
        
        if (username === 'ERROR404' && password === 'Hackaton2026') {
            userRole = 'admin';
        } else if (!username || !password) {
            return { error: 'Заполните логин и пароль' };
        }

        const user = { username, role: userRole, history: [] };
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { user };
    },

    logout() {
        localStorage.removeItem('currentUser');
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    },

    addToHistory(product) {
        const userData = this.getCurrentUser();
        if (userData) {
            if (!userData.history.find(h => h.id === product.id)) {
                userData.history.unshift({
                    id: product.id,
                    title: product.title,
                    url: product.url
                });
                if(userData.history.length > 10) userData.history.pop();
                localStorage.setItem('currentUser', JSON.stringify(userData));
            }
        }
    }
};