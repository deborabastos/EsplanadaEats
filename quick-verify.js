// Quick verification script - paste this in browser console on any Firebase-connected page

async function quickVerify() {
    console.log('🔍 Verificando limpeza do Firebase...');

    try {
        const db = firebase.firestore();
        const storage = firebase.storage();

        // Check restaurants
        const restaurants = await db.collection('restaurants').get();
        console.log(`🍽️ Restaurantes: ${restaurants.size} encontrados`);
        if (restaurants.size > 0) {
            restaurants.forEach(doc => {
                console.log(`   - ${doc.data().name} (ID: ${doc.id})`);
            });
        }

        // Check ratings
        const ratings = await db.collection('ratings').get();
        console.log(`⭐ Avaliações: ${ratings.size} encontradas`);
        if (ratings.size > 0) {
            ratings.forEach(doc => {
                const data = doc.data();
                console.log(`   - Rating ${data.rating} por ${data.userName} (ID: ${doc.id})`);
            });
        }

        // Check user tracking
        const userTracking = await db.collection('userTracking').get();
        console.log(`👤 Rastreamento: ${userTracking.size} encontrados`);

        // Check storage
        try {
            const storageRef = storage.ref('restaurants');
            const listResult = await storageRef.listAll();
            console.log(`📸 Fotos: ${listResult.items.length} encontradas`);
            listResult.items.forEach(item => {
                console.log(`   - ${item.name}`);
            });
        } catch (e) {
            console.log(`📸 Fotos: Erro ao verificar - ${e.message}`);
        }

        const total = restaurants.size + ratings.size + userTracking.size;
        console.log(`📦 Total de itens: ${total}`);

        if (total === 0) {
            console.log('✅ SUCESSO! Firebase está completamente limpo.');
        } else {
            console.log('⚠️ Ainda existem dados no Firebase.');
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// Execute
quickVerify();