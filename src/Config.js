const config = {
    API_URL: "",

    AUTH: {
        KAKAO: "/api/auth/kakao",
        REISSUE: "/api/auth/reissue",
        LOGOUT: "/api/auth/logout",
        WITHDRAW: "/api/auth/withdraw",
    },

    FOLLOW: {
        FOLLOWINGS: "/api/follow/followings",
        DELETE: "/api/follow",
    },

    PROFILE: {
        GET: "/api/profile",
        PUT: "/api/profile",
        DELETE: "/api/profile",
        INTRO: "/api/profile/intro",
    },

    CALENDAR: {
        GET: "/api/todos/calendar",
    },

    TODOS: {
        LIST: "/api/todos",
        DETAIL: (todoId) => `/api/todos/${encodeURIComponent(todoId)}`,
        CREATE: "/api/todos",
        UPDATE: (todoId) => `/api/todos/${encodeURIComponent(todoId)}`,
        DELETE: (todoId, date) =>
            `/api/todos/${encodeURIComponent(todoId)}/dates/${date}`,
        TOGGLE_COMPLETE: (todoId, date) =>
            `/api/todos/${encodeURIComponent(todoId)}/dates/${date}/complete`,
    },

    CATEGORIES: {
        GET: "/api/categories",
    },
};

export default config;
