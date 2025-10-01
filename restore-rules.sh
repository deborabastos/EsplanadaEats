#!/bin/bash

# restore-rules.sh - Script to restore original Firestore and Storage rules after cleanup

echo "🔒 Restaurando regras originais do Firebase..."

# Check if Firestore backup exists
if [ ! -f "firestore.rules.backup" ]; then
    echo "❌ Backup das regras do Firestore não encontrado!"
    exit 1
fi

# Check if Storage backup exists
if [ ! -f "storage.rules.backup" ]; then
    echo "❌ Backup das regras do Storage não encontrado!"
    exit 1
fi

# Restore original Firestore rules
cp firestore.rules.backup firestore.rules
echo "✅ Regras originais do Firestore restauradas"

# Restore original Storage rules
cp storage.rules.backup storage.rules
echo "✅ Regras originais do Storage restauradas"

# Deploy original rules
echo "🚀 Implantando regras originais..."
firebase deploy --only firestore:rules,storage --project esplanada-eats

if [ $? -eq 0 ]; then
    echo "✅ Regras originais implantadas com sucesso!"
    echo "🔒 Firestore e Storage agora estão seguros novamente com as regras de produção."
else
    echo "❌ Erro ao implantar regras originais"
    exit 1
fi

echo ""
echo "📋 Resumo:"
echo "   ✅ Regras de segurança do Firestore restauradas"
echo "   ✅ Regras de segurança do Storage restauradas"
echo "   🔒 Firebase protegido novamente"
echo "   🚀 Sistema pronto para uso normal"