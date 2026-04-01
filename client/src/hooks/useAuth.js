import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (userDoc) => {
      setUser(userDoc);
      if (userDoc) {
        try {
          const docRef = doc(db, "adminUsers", userDoc.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setAdminData(docSnap.data());
          } else {
            setAdminData(null);
          }
        } catch (err) {
          console.error("Error fetching admin data", err);
          setAdminData(null);
        }
      } else {
        setAdminData(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const isAdmin = !!(user && adminData?.isActive);
  const isSuperAdmin = isAdmin && adminData?.role === "superadmin";

  return { user, adminData, isAdmin, isSuperAdmin, loading };
};
