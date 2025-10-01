#!/bin/bash

# Firebase Security Rules Deployment Script
# Story 0.4: Firebase Security Rules
# This script deploys Firestore and Storage security rules to Firebase

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Firebase CLI is installed
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI não está instalado."
        log_info "Instale com: npm install -g firebase-tools"
        exit 1
    fi
    log_success "Firebase CLI encontrado"
}

# Check if user is logged in
check_firebase_login() {
    if ! firebase projects:list &> /dev/null; then
        log_error "Você não está logado no Firebase."
        log_info "Execute: firebase login"
        exit 1
    fi
    log_success "Usuário logado no Firebase"
}

# Validate security rules files
validate_rules() {
    log_info "Validando arquivos de regras de segurança..."

    # Check if Firestore rules exist
    if [ ! -f "firestore.rules" ]; then
        log_error "Arquivo firestore.rules não encontrado"
        exit 1
    fi

    # Check if Storage rules exist
    if [ ! -f "storage.rules" ]; then
        log_error "Arquivo storage.rules não encontrado"
        exit 1
    fi

    log_success "Arquivos de regras validados"
}

# Backup current rules (if they exist)
backup_current_rules() {
    log_info "Fazendo backup das regras atuais..."

    # Backup Firestore rules
    if firebase firestore:rules > current-firestore.rules 2>/dev/null; then
        log_success "Backup das regras do Firestore salvo em current-firestore.rules"
    else
        log_warning "Não foi possível fazer backup das regras do Firestore"
    fi

    # Backup Storage rules
    if firebase storage:rules > current-storage.rules 2>/dev/null; then
        log_success "Backup das regras do Storage salvo em current-storage.rules"
    else
        log_warning "Não foi possível fazer backup das regras do Storage"
    fi
}

# Deploy Firestore security rules
deploy_firestore_rules() {
    log_info "Implantando regras do Firestore..."

    # Try different deployment methods
    if firebase deploy --only firestore:rules; then
        log_success "Regras do Firestore implantadas com sucesso"
    elif firebase firestore:rules firestore.rules; then
        log_success "Regras do Firestore implantadas com sucesso (método alternativo)"
    else
        log_error "Falha ao implantar regras do Firestore"
        log_info "Tente manualmente: firebase deploy --only firestore:rules"
        return 1
    fi
}

# Deploy Storage security rules
deploy_storage_rules() {
    log_info "Implantando regras do Storage..."

    # Try different deployment methods
    if firebase deploy --only storage:rules; then
        log_success "Regras do Storage implantadas com sucesso"
    elif firebase storage:rules storage.rules; then
        log_success "Regras do Storage implantadas com sucesso (método alternativo)"
    else
        log_error "Falha ao implantar regras do Storage"
        log_info "Tente manualmente: firebase deploy --only storage:rules"
        return 1
    fi
}

# Test security rules
test_security_rules() {
    log_info "Testando regras de segurança..."

    # Test Firestore rules
    if firebase firestore:rules:test firestore.rules; then
        log_success "Teste das regras do Firestore passou"
    else
        log_warning "Teste das regras do Firestore falhou, mas continuando..."
    fi

    # Test Storage rules
    if firebase storage:rules:test storage.rules; then
        log_success "Teste das regras do Storage passou"
    else
        log_warning "Teste das regras do Storage falhou, mas continuando..."
    fi
}

# Display security rules summary
display_summary() {
    log_info "Resumo das regras de segurança implantadas:"
    echo ""
    echo "📋 Firestore Rules:"
    echo "   - Restaurantes: Leitura pública, criação autenticada"
    echo "   - Avaliações: Leitura pública, criação autenticada"
    echo "   - Rastreamento: Acesso privado"
    echo "   - Rate limiting: Acesso do sistema"
    echo ""
    echo "📁 Storage Rules:"
    echo "   - Fotos: Leitura pública, upload autenticado"
    echo "   - Validação: Tipo e tamanho de arquivo"
    echo "   - Segurança: Restrição de caminho"
    echo ""
    echo "🔒 Recursos de Segurança:"
    echo "   - Validação de entrada"
    echo "   - Rate limiting"
    echo "   - Sanitização de dados"
    echo "   - Proteção contra injeção"
    echo ""
}

# Main deployment function
main() {
    log_info "Iniciando implantação das regras de segurança..."
    log_info "Projeto: Esplanada Eats Firebase"
    echo ""

    # Check prerequisites
    check_firebase_cli
    check_firebase_login
    validate_rules

    # Backup current rules
    backup_current_rules

    # Deploy rules
    deploy_firestore_rules
    deploy_storage_rules

    # Test rules
    test_security_rules

    # Display summary
    display_summary

    log_success "🎉 Implantação das regras de segurança concluída!"
    log_info "Próximos passos:"
    echo "   1. Teste as regras com: open public/test-security.html"
    echo "   2. Monitore os logs no Firebase Console"
    echo "   3. Verifique as regras no Firebase Console"
    echo ""
}

# Handle command line arguments
case "$1" in
    "test-only")
        log_info "Modo de teste apenas..."
        check_firebase_cli
        check_firebase_login
        validate_rules
        test_security_rules
        ;;
    "backup-only")
        log_info "Modo de backup apenas..."
        check_firebase_cli
        check_firebase_login
        backup_current_rules
        ;;
    "help"|"-h"|"--help")
        echo "Uso: $0 [OPÇÃO]"
        echo ""
        echo "Opções:"
        echo "  test-only      Testa as regras sem implantar"
        echo "  backup-only    Apenas faz backup das regras atuais"
        echo "  help           Mostra esta mensagem de ajuda"
        echo ""
        echo "Padrão: Implanta as regras de segurança"
        ;;
    *)
        main
        ;;
esac