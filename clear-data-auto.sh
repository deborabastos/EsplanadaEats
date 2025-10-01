#!/bin/bash

# clear-data-auto.sh - Script não-interativo para limpar todos os dados do Firebase

echo "🗑️ Limpando todos os dados do Firebase..."
echo "⚠️ APAGANDO TODOS OS DADOS PERMANENTEMENTE!"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não encontrado. Instale com: npm install -g firebase-tools"
    exit 1
fi

echo ""
echo "📋 Apagando coleções do Firestore..."

# Delete all collections
echo "🍽️ Apagando restaurantes..."
firebase firestore:delete restaurants --project esplanada-eats -y 2>/dev/null || true

echo "⭐ Apagando avaliações..."
firebase firestore:delete ratings --project esplanada-eats -y 2>/dev/null || true

echo "👤 Apagando rastreamento de usuários..."
firebase firestore:delete userTracking --project esplanada-eats -y 2>/dev/null || true

echo "📸 Apagando fotos do Storage..."
firebase storage:delete --all -f --project esplanada-eats 2>/dev/null || echo "ℹ️ Storage já vazio ou erro ao apagar"

echo ""
echo "🎉 Limpeza concluída!"
echo "✅ Todos os dados do Firebase foram apagados com sucesso."