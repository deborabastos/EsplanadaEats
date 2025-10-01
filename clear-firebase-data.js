// clear-firebase-data.js - Script to clear all data from Firebase

// Import Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js';
import { getStorage, ref, listAll, deleteObject } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage-compat.js';

// Firebase configuration (same as src/firebase-config.js)
const firebaseConfig = {
    apiKey: "AIzaSyCjV2x2f2sKk6K4n8m0p4s5t6u7v8w9x0y",
    authDomain: "esplanada-eats.firebaseapp.com",
    projectId: "esplanada-eats",
    storageBucket: "esplanada-eats.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789012345678"
};

console.log('🔧 Initializing Firebase for data cleanup...');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

async function clearAllData() {
    try {
        console.log('🗑️ Starting complete Firebase data cleanup...');

        let totalDeleted = {
            restaurants: 0,
            ratings: 0,
            userTracking: 0,
            photos: 0
        };

        // 1. Clear all restaurants
        console.log('📋 Clearing restaurants...');
        const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
        for (const doc of restaurantsSnapshot.docs) {
            await deleteDoc(doc.ref);
            totalDeleted.restaurants++;
        }
        console.log(`✅ Deleted ${totalDeleted.restaurants} restaurants`);

        // 2. Clear all ratings
        console.log('⭐ Clearing ratings...');
        const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
        for (const doc of ratingsSnapshot.docs) {
            await deleteDoc(doc.ref);
            totalDeleted.ratings++;
        }
        console.log(`✅ Deleted ${totalDeleted.ratings} ratings`);

        // 3. Clear all user tracking data
        console.log('👤 Clearing user tracking data...');
        const userTrackingSnapshot = await getDocs(collection(db, 'userTracking'));
        for (const doc of userTrackingSnapshot.docs) {
            await deleteDoc(doc.ref);
            totalDeleted.userTracking++;
        }
        console.log(`✅ Deleted ${totalDeleted.userTracking} user tracking records`);

        // 4. Clear all photos from storage
        console.log('📸 Clearing photos from storage...');
        try {
            const storageRef = ref(storage, 'restaurants');
            const listResult = await listAll(storageRef);

            // Delete all items in root restaurants folder
            for (const itemRef of listResult.items) {
                await deleteObject(itemRef);
                totalDeleted.photos++;
            }

            // Delete all subfolders
            for (const folderRef of listResult.prefixes) {
                const subListResult = await listAll(folderRef);
                for (const itemRef of subListResult.items) {
                    await deleteObject(itemRef);
                    totalDeleted.photos++;
                }
            }

            console.log(`✅ Deleted ${totalDeleted.photos} photos`);
        } catch (storageError) {
            console.log('ℹ️ No photos found in storage or storage error:', storageError.message);
        }

        // 5. Summary
        console.log('\n🎉 Firebase cleanup completed successfully!');
        console.log('📊 Summary of deleted items:');
        console.log(`   🍽️  Restaurants: ${totalDeleted.restaurants}`);
        console.log(`   ⭐ Ratings: ${totalDeleted.ratings}`);
        console.log(`   👤 User Tracking: ${totalDeleted.userTracking}`);
        console.log(`   📸 Photos: ${totalDeleted.photos}`);
        console.log(`   📦 Total: ${totalDeleted.restaurants + totalDeleted.ratings + totalDeleted.userTracking + totalDeleted.photos} items`);

        return totalDeleted;

    } catch (error) {
        console.error('❌ Error during Firebase cleanup:', error);
        throw error;
    }
}

// Execute cleanup
clearAllData()
    .then(result => {
        console.log('✅ All Firebase data has been cleared successfully!');
        console.log('You can now start fresh with new data.');
    })
    .catch(error => {
        console.error('❌ Failed to clear Firebase data:', error);
    });