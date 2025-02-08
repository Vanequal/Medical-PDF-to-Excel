// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAhUaSbC8bEhRIS_VPXXEFRUNZzOUWQ51Q",
    authDomain: "medical-pdf-to-excell.firebaseapp.com",
    projectId: "medical-pdf-to-excell",
    storageBucket: "medical-pdf-to-excell.firebasestorage.app",
    messagingSenderId: "837960774222",
    appId: "1:837960774222:web:925e41d41fff51058d091f",
    measurementId: "G-1WB3RG53GL",
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Экспорт аутентификации
export const auth = getAuth(app);