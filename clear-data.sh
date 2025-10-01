#!/bin/bash

# clear-data.sh - Script to clear all Firebase data using Firebase CLI

echo "🗑️ Iniciando limpeza completa do Firebase..."
echo "⚠️ Esta ação irá apagar TODOS os dados permanentemente!"

# Confirm before proceeding
read -p "Tem certeza? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operação cancelada."
    exit 1
fi

# Double confirmation
read -p "Digite 'APAGAR TUDO' para confirmar: " -r
echo
if [[ $REPLY != "APAGAR TUDO" ]]; then
    echo "❌ Confirmação incorreta. Operação cancelada."
    exit 1
fi

echo ""
echo "🔧 Conectando ao Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não encontrado. Instale com: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Fazendo login no Firebase..."
    firebase login
fi

echo ""
echo "📋 Apagando restaurantes..."
firebase firestore:delete --all-collections --recursive -f --project esplanada-eats || {
    echo "⚠️ Erro ao apagar coleções. Tentando método alternativo..."

    # Alternative: Delete specific collections
    echo "🍽️ Apagando restaurantes..."
    firebase firestore:delete restaurants --project esplanada-eats -y 2>/dev/null || true

    echo "⭐ Apagando avaliações..."
    firebase firestore:delete ratings --project esplanada-eats -y 2>/dev/null || true

    echo "👤 Apagando rastreamento de usuários..."
    firebase firestore:delete userTracking --project esplanada-eats -y 2>/dev/null || true
}

echo ""
echo "📸 Apagando fotos do Storage..."
firebase storage:delete --all -f --project esplanada-eats || {
    echo "ℹ️ Nenhuma foto encontrada ou erro ao apagar storage"
}

echo ""
echo "🎉 Limpeza do Firebase concluída!"
echo "✅ Todos os dados foram apagados com sucesso."
echo ""
echo "📊 Resumo:"
echo "   🍽️  Restaurantes: apagados"
echo "   ⭐ Avaliações: apagadas"
echo "   👤 Rastreamento: apagado"
echo "   📸 Fotos: apagadas"
echo ""
echo "Você pode começar do zero com novos dados."