// Script rápido para corrigir as contagens de avaliações
// Execute este script no console da página debug-ratings.html

async function quickFixRatingCounts() {
    try {
        console.log('🔧 Iniciando correção rápida das contagens de avaliações...');

        if (!window.EsplanadaEatsFirebase || !window.EsplanadaEatsFirebase.firebase) {
            throw new Error('Firebase não inicializado');
        }

        // Import StorageService
        const { StorageService } = await import('./js/services/storage-service.js?v=2.1.0');
        const storageService = new StorageService(window.EsplanadaEatsFirebase.firebase);

        const restaurants = await storageService.getRestaurants();
        console.log(`📊 Processando ${restaurants.length} restaurantes...`);

        let fixedCount = 0;

        for (const restaurant of restaurants) {
            try {
                console.log(`🔧 Atualizando: ${restaurant.name} (ID: ${restaurant.id})`);
                await storageService.updateRestaurantAverageRating(restaurant.id);
                fixedCount++;
                console.log(`✅ ${restaurant.name} atualizado com sucesso!`);
            } catch (error) {
                console.error(`❌ Erro ao atualizar ${restaurant.name}:`, error.message);
            }
        }

        console.log(`🎉 ${fixedCount} restaurantes atualizados com sucesso!`);
        console.log('📊 Recarregue a página para ver os resultados atualizados.');

        return fixedCount;

    } catch (error) {
        console.error('❌ Erro na correção rápida:', error.message);
        return 0;
    }
}

// Executar a correção
quickFixRatingCounts().then(count => {
    console.log(`Correção concluída! ${count} restaurantes atualizados.`);
});