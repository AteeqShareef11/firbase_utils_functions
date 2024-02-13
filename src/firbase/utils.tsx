import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  Auth,
  UserCredential,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { app } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  query,
  where,
  doc,
  setDoc,
  orderBy,
  startAfter,
  limit
} from 'firebase/firestore';
import { toast } from 'react-toastify';

import { getFirestore } from 'firebase/firestore';
import { calculateTotalBuySellAndPL } from 'src/content/dashboards/Crypto/utils';
const db = getFirestore(app);

const auth = getAuth(app);
// export const db = firebase.firestore();

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Initialize Firebase
const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    if (user) {
      console.log('user', user);
      await addUser(user);
    }
    return user;
  } catch (err) {
    console.error(err);
    toast.error(err.message);
  }
};

const signInWithFacebook = async () => {
  try {
    const res = await signInWithPopup(auth, facebookProvider);
    const user = res.user;
    console.log(user);
  } catch (err) {
    console.error(err);
    toast.error(err.message);
  }
};

const createUserWithEmailPasswordAndName = async (
  email: any,
  password: any,
  fullName: any
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await updateProfile(user, { displayName: fullName });
    console.log(
      `User account created for ${user.email} with name ${user.displayName}`
    );
    return user;
  } catch (error) {
    console.error(error);
    toast.error(error.message);
    throw error;
  }
};

const signInWithEmailAndPasswords = async (
  auth: Auth,
  email: string,
  password: string
): Promise<UserCredential['user']> => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;
    return user;
  } catch (err: any) {
    console.error(err);
    toast.error(err.message);
    throw err;
  }
};

const getCurrentUser = () => {
  const auth = getAuth();
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

const addCsvDoc = async (element: any, user: any) => {
  const userRef = collection(db, 'users_data', user.uid, 'user_data');
  const res = await addDoc(userRef, {
    ...element,
    trade_date: Timestamp.fromDate(new Date(element.trade_date)),
    expiry_date: Timestamp.fromDate(new Date(element.expiry_date)),
    order_execution_time: Timestamp.fromDate(
      new Date(element.order_execution_time)
    ),

    order_id: String(Number(element.order_id))
  });
  console.log('res', res);
};

const addUser = async (user: any) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      uid: user.uid,
      createdAt: new Date()
    });
    console.log('User added successfully');
  } catch (error) {
    console.error('Error adding user', error);
  }
};

const getLastMonthUserData = async () => {
  try {
    const user: any = await getCurrentUser();
    if (user) {
      const currentDate = new Date('2023-03-1');
      const lastMonthStartDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );
      const lastMonthEndDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      );

      const userDataRef = collection(db, `users_data/${user.uid}/user_data`);
      const q = query(
        userDataRef,
        where('trade_date', '>=', lastMonthStartDate),
        where('trade_date', '<=', lastMonthEndDate)
      );
      const querySnapshot = await getDocs(q);

      console.log(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } else {
      toast.error('No user is currently logged in.');
      console.log('No user is currently logged in.');
    }
  } catch (error) {
    toast.error(error.message);

    console.error('Error getting documents: ', error.message);
  }
};

const getLastWeekTradeData = async () => {
  try {
    const user: any = await getCurrentUser();
    if (user) {
      const currentDate = new Date('2023-02-10');
      const lastWeekStartDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 7
      );
      const lastWeekEndDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 1
      );

      const userDataRef = collection(db, `users_data/${user.uid}/user_data`);
      const q = query(
        userDataRef,
        where('trade_date', '>=', lastWeekStartDate),
        where('trade_date', '<=', lastWeekEndDate)
      );
      const querySnapshot = await getDocs(q);

      console.log(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } else {
      console.log('No user is currently logged in.');
    }
  } catch (error) {
    toast.error(error.message);

    console.error('Error getting documents: ', error.message);
  }
};

const getLastSixMonthTradeData = async () => {
  try {
    const user: any = await getCurrentUser();
    if (user) {
      const currentDate = new Date('2023-05-05');
      const lastSixMonthStartDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 6,
        currentDate.getDate()
      );
      const lastSixMonthEndDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 1
      );

      const userDataRef = collection(db, `users_data/${user.uid}/user_data`);
      const q = query(
        userDataRef,
        where('trade_date', '>=', lastSixMonthStartDate),
        where('trade_date', '<=', lastSixMonthEndDate)
      );
      const querySnapshot = await getDocs(q);

      console.log(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } else {
      console.log('No user is currently logged in.');
    }
  } catch (error) {
    toast.error(error.message);

    console.error('Error getting documents: ', error.message);
  }
};

const getLastYearTradeData = async () => {
  try {
    const user: any = await getCurrentUser();
    if (user) {
      const currentDate = new Date();
      const lastYearStartDate = new Date(
        currentDate.getFullYear() - 1,
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const lastYearEndDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 1
      );

      const userDataRef = collection(db, `users_data/${user.uid}/user_data`);
      const q = query(
        userDataRef,
        where('trade_date', '>=', lastYearStartDate),
        where('trade_date', '<=', lastYearEndDate)
      );
      const querySnapshot = await getDocs(q);

      console.log(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } else {
      console.log('No user is currently logged in.');
    }
  } catch (error) {
    toast.error(error.message);

    console.error('Error getting documents: ', error.message);
  }
};



const getAllUserData = async () => {
  try {
    const user: any = await getCurrentUser();
    if (user) {
      const querySnapshot = await getDocs(
        collection(db, `users_data/${user.uid}/user_data`)
      );
      console.log(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } else {
      toast.error('No user is currently logged in.');

      console.log('');
    }
  } catch (error) {
    toast.error(error.message);

    console.error('Error getting documents: ', error.message);
  }
};



// export const getAllUserDatas = async (last: any) => {
//   try {
//     const user: any = await getCurrentUser();
//     if (user) {
//       let handleQuery;
//      if (last) {
//         handleQuery = query(
//           collection(db, `users_data/${user.uid}/user_data`),
//           orderBy("trade_id"),
//           startAfter(last),
//           limit(10)
//         );
//       }
//       handleQuery = query(
//         collection(db, `users_data/${user.uid}/user_data`),
//         limit(10)
//       );
//       const querySnapshot:any = await getDocs(handleQuery);
//       console.log(
//         querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
//       );
//       const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

//       return {
//         data: querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
//         lastVisible: lastVisible
//       };
//     } else {
//       toast.error('No user is currently logged in.');

//       console.log('');
//     }
//   } catch (error) {
//     toast.error(error.message);

//     console.error('Error getting documents: ', error.message);
//   }
// };

// const nextUserData = async () => {
//   try {
    
//   } catch (error) {
    
//   }
// }

const Logout = async () => {
  try {
    const res = await signOut(auth);
    console.log('res', res);
  } catch (error) {
    console.log(error);
  }
};

export {
  auth,
  signInWithGoogle,
  signInWithFacebook,
  signInWithEmailAndPasswords,
  addCsvDoc,
  getCurrentUser,
  getLastMonthUserData,
  getAllUserData,
  createUserWithEmailPasswordAndName,
  Logout,
  getLastWeekTradeData,
  getLastSixMonthTradeData,
  getLastYearTradeData
};
