# 🎛️ GUIA DE CONFIGURAÇÕES - PAINEL ADMINISTRATIVO

## 📍 **ONDE ENCONTRAR AS CONFIGURAÇÕES**

### **🔐 Acesso ao Painel Admin:**
1. **URL:** `http://localhost:3000`
2. **Login:** `contato@danilobrandao.com.br`
3. **Senha:** `Zy598859D@n`

---

## 🗂️ **MENU LATERAL - CONFIGURAÇÕES DISPONÍVEIS**

### **📊 DASHBOARD**
- **Rota:** `/`
- **Função:** Visão geral do sistema
- **Configurações:** Estatísticas e métricas

### **🚤 EMBARCAÇÕES**
- **Rota:** `/vessels`
- **Função:** Gerenciar embarcações
- **Configurações:**
  - ✅ Adicionar/editar embarcações
  - ✅ Configurar limites de reserva
  - ✅ Definir tipos e capacidades

### **📅 AGENDAMENTOS**
- **Rota:** `/bookings`
- **Função:** Gerenciar reservas
- **Configurações:**
  - ✅ Visualizar todas as reservas
  - ✅ Aprovar/rejeitar reservas
  - ✅ Cancelar reservas

### **⚡ PAINEL FINANCEIRO**
- **Rota:** `/financial-priority`
- **Função:** Controle financeiro prioritário
- **Configurações:**
  - ✅ Pagamentos pendentes
  - ✅ Cobranças prioritárias
  - ✅ Relatórios financeiros

### **💰 CONTROLE FINANCEIRO**
- **Rota:** `/financial`
- **Função:** Gestão financeira completa
- **Configurações:**
  - ✅ Configurar valores
  - ✅ Definir vencimentos
  - ✅ Gerenciar cobranças

### **📢 GERENCIAR NOTIFICAÇÕES** ⭐
- **Rota:** `/notification-management`
- **Função:** Configurar WhatsApp e notificações
- **Configurações:**
  - ✅ Enviar notificações manuais
  - ✅ Configurar templates
  - ✅ Visualizar histórico
  - ✅ Estatísticas de envio

### **👥 USUÁRIOS**
- **Rota:** `/users`
- **Função:** Gerenciar usuários
- **Configurações:**
  - ✅ Adicionar/editar usuários
  - ✅ Definir permissões
  - ✅ Ativar/desativar contas

### **🚫 BLOQUEIOS**
- **Rota:** `/blocked-dates`
- **Função:** Bloquear datas específicas
- **Configurações:**
  - ✅ Definir datas indisponíveis
  - ✅ Configurar motivos
  - ✅ Bloqueios por embarcação

### **⏰ BLOQUEIOS SEMANAIS**
- **Rota:** `/weekly-blocks`
- **Função:** Bloqueios recorrentes
- **Configurações:**
  - ✅ Configurar horários fixos
  - ✅ Manutenções programadas
  - ✅ Padrões semanais

### **📈 ANALYTICS**
- **Rota:** `/analytics`
- **Função:** Relatórios e métricas
- **Configurações:**
  - ✅ Configurar dashboards
  - ✅ Definir métricas
  - ✅ Exportar relatórios

### **🔒 SEGURANÇA 2FA**
- **Rota:** `/two-factor`
- **Função:** Autenticação de dois fatores
- **Configurações:**
  - ✅ Ativar/desativar 2FA
  - ✅ Configurar códigos de backup
  - ✅ Gerenciar dispositivos

---

## 🎯 **CONFIGURAÇÕES PRINCIPAIS PARA WHATSAPP**

### **1. 📢 Gerenciar Notificações** (Principal)
- **Localização:** Menu lateral → "Gerenciar Notificações"
- **URL:** `http://localhost:3000/notification-management`
- **Funcionalidades:**
  - ✅ Enviar notificações manuais
  - ✅ Visualizar estatísticas
  - ✅ Histórico de envios
  - ✅ Configurar destinatários

### **2. 🚤 Embarcações** (Configurar dados)
- **Localização:** Menu lateral → "Embarcações"
- **URL:** `http://localhost:3000/vessels`
- **Para WhatsApp:** Configurar nomes das embarcações

### **3. 👥 Usuários** (Configurar dados)
- **Localização:** Menu lateral → "Usuários"
- **URL:** `http://localhost:3000/users`
- **Para WhatsApp:** Configurar nomes e telefones

---

## 🔧 **CONFIGURAÇÕES TÉCNICAS (Backend)**

### **Variáveis de Ambiente:**
```env
N8N_WEBHOOK_URL=http://n8n:5678/webhook/agendamentos
N8N_WEBHOOK_TOKEN=seu-webhook-token
```

### **Arquivos de Configuração:**
- `docker-compose.yml` - Configuração dos serviços
- `backend/src/config/index.ts` - Configurações do backend
- `backend/src/services/webhook.service.ts` - Serviço de webhook

---

## 📱 **CONFIGURAÇÃO DO N8N (WhatsApp)**

### **Acesso ao n8n:**
1. **URL:** `http://localhost:5678`
2. **Login:** `admin`
3. **Senha:** `admin123`

### **Passos para Configurar:**
1. **Importar workflow:** `n8n-whatsapp-workflow.json`
2. **Configurar WhatsApp Business API**
3. **Ativar workflow**
4. **Testar integração**

---

## 🎯 **FLUXO DE CONFIGURAÇÃO RECOMENDADO**

### **1. Configuração Inicial:**
1. ✅ Acesse o painel admin
2. ✅ Configure embarcações em "Embarcações"
3. ✅ Configure usuários em "Usuários"
4. ✅ Configure n8n para WhatsApp

### **2. Configuração de Notificações:**
1. ✅ Acesse "Gerenciar Notificações"
2. ✅ Teste envio manual
3. ✅ Configure templates
4. ✅ Monitore estatísticas

### **3. Configuração Financeira:**
1. ✅ Configure valores em "Controle Financeiro"
2. ✅ Defina vencimentos
3. ✅ Configure cobranças

### **4. Configuração de Segurança:**
1. ✅ Ative 2FA em "Segurança 2FA"
2. ✅ Configure bloqueios em "Bloqueios"
3. ✅ Configure bloqueios semanais

---

## 🚀 **RESULTADO FINAL**

**Todas as configurações estão centralizadas no painel administrativo!**

- **Interface intuitiva** e organizada
- **Configurações por categoria** (Financeiro, Notificações, Usuários, etc.)
- **Acesso rápido** via menu lateral
- **Feedback visual** em todas as operações

**O sistema está pronto para configuração completa!** 🎉








