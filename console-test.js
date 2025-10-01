// Test script for Firebase permissions
console.log('🧪 Iniciando teste de permissões do Firebase...');

// Test 1: Read existing restaurants
window.EsplanadaEatsFirebase.db.collection('restaurants').limit(3).get()
    .then(snapshot => {
        console.log(`✅ Leitura de restaurantes: ${snapshot.size} encontrados`);
        snapshot.forEach(doc => {
            console.log(`🍽️ ${doc.data().name} - Qualidade: ${doc.data().averageQuality || 0}`);
        });
    })
    .catch(error => {
        console.error('❌ Erro ao ler restaurantes:', error.message);
    });

// Test 2: Create test restaurant
const testRestaurant = {
    name: 'Restaurante Teste Console',
    address: 'Endereço Teste',
    phone: '123456789',
    category: 'Teste',
    description: 'Teste de permissions',
    price: 2,
    averageQuality: 0,
    createdAt: new Date(),
    updatedAt: new Date()
};

window.EsplanadaEatsFirebase.db.collection('restaurants').add(testRestaurant)
    .then(docRef => {
        console.log(`✅ Restaurante criado: ${docRef.id}`);

        // Test 3: Update restaurant with rating data
        const ratingUpdate = {
            averageQuality: 5,
            averageTaste: 4,
            averagePrice: 3,
            averageAmbiance: 4,
            averageService: 5,
            averageOverall: 4,
            totalReviews: 1
        };

        return window.EsplanadaEatsFirebase.db.collection('restaurants').doc(docRef.id).update(ratingUpdate);
    })
    .then(() => {
        console.log('✅ SUCESSO! Atualização de média do restaurante funcionou!');
        console.log('🎉 O sistema de avaliação deve estar funcionando corretamente agora.');
    })
    .catch(error => {
        console.error('❌ Erro ao atualizar restaurante:', error.message);
        console.error('Código do erro:', error.code);
        if (error.message.includes('permission')) {
            console.error('🚨 PROBLEMA DE PERMISSÃO DETECTADO - Verificar regras do Firestore');
        }
    });

console.log('📝 Testes iniciados. Verifique o console para resultados.');