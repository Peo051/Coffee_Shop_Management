/* 
========================================================================================

                                     CODE BỞI NGUYỄN THẾ ANH

========================================================================================
*/

/**
 * firebase.js - Cấu hình Firebase cho toàn bộ ứng dụng
 *
 * File này khởi tạo Firebase App và export đối tượng `auth`
 * để các module khác (loginregister.js,...) sử dụng.
 *
 * SDK: Firebase v10 modular (tree-shakable)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// Cấu hình Firebase — lấy từ Firebase Console > Project Settings
const firebaseConfig = {
  apiKey: "AIzaSyCHlDt2bUN4YWJon-lj7941SQcmCT7m1_E",
  authDomain: "manage-coffee-3a860.firebaseapp.com",
  projectId: "manage-coffee-3a860",
  storageBucket: "manage-coffee-3a860.firebasestorage.app",
  messagingSenderId: "655567890516",
  appId: "1:655567890516:web:0fab5cfe362cd97db265c1",
  measurementId: "G-LB57G2S1N2"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Export Firebase Auth để dùng ở các module khác
export const auth = getAuth(app);

/*
  Lưu ý: phần logic đăng nhập (Google/GitHub) nằm trong loginregister.js
  để giữ firebase.js chỉ chứa cấu hình cơ bản.
*/

/* 
========================================================================================

                                    KẾT THÚC CODE BỞI NGUYỄN THẾ ANH

========================================================================================
*/
