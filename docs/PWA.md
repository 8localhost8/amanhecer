# Progressive Web App (PWA) e Instalação — Amanhecer 2.0

## 1. Visão Geral do PWA

O Amanhecer foi concebido prioritariamente como um **Progressive Web App (PWA) moderno e autônomo**, garantindo:
- Instalação nativa em Android, iOS e Desktop sem depender de lojas de aplicativos.
- Abertura em tela cheia no modo `standalone`.
- Funcionamento offline para toda a interface, devocionais em cache, favoritos e diário.
- Atualização contínua com `registerType: 'autoUpdate'`.

---

## 2. Manifest do Aplicativo (`public/manifest.webmanifest`)

O manifesto define a identidade e cores do app:
- `name`: "Amanhecer — Devocional Diário"
- `short_name`: "Amanhecer"
- `start_url`: "/"
- `display`: "standalone"
- `background_color`: "#072a49"
- `theme_color`: "#072a49"
- `orientation`: "portrait"
- `icons`:
  - `icon-192x192.png`: Ícone para launchers Android padrão.
  - `icon-512x512.png`: Ícone para telas de alta resolução e splash screen.
  - `icon-512x512.png (maskable)`: Compatibilidade com adaptative icons do Android.
  - `icon.svg`: Ícone vetorial sem perda de resolução.

---

## 3. Instruções de Instalação por Plataforma

O botão de ajuda `?` no cabeçalho e na landing page abre um modal acessível com instruções ilustradas para cada sistema operacional:

### 3.1. Android
1. O app escuta o evento nativo `beforeinstallprompt`. Quando disponível, exibe o botão direto "Instalar Agora no Android".
2. Caso o prompt não apareça, orienta o usuário:
   - Toque no menu (três pontinhos no canto superior direito).
   - Selecione "Instalar aplicativo" ou "Adicionar à tela inicial".
   - Confirme a instalação.

### 3.2. iPhone / iPad (iOS)
Como o Safari no iOS não oferece o evento `beforeinstallprompt`, o app orienta com clareza:
1. Abra no navegador Safari.
2. Toque no botão de **Compartilhar** (quadrado com uma seta para cima na barra inferior).
3. Role e toque em **"Adicionar à Tela de Início"**.
4. Toque em "Adicionar" no canto superior direito.

### 3.3. Computadores (Windows, macOS, Linux)
1. No Google Chrome, Microsoft Edge ou Brave, localize o ícone de computador com uma seta de download na extremidade direita da barra de endereços.
2. Clique em **"Instalar Amanhecer"**. O aplicativo passará a ser executado em janela limpa e independente com atalho no menu Iniciar / Área de Trabalho.

---

## 4. Estratégia de Cache e Modo Offline

Utilizamos o plugin `vite-plugin-pwa` com Workbox:
- **Precache:** Todos os arquivos estáticos (`.js`, `.css`, `.html`, `.svg`, `.png`, `.webmanifest`).
- **Google Fonts Cache:** `CacheFirst` com validade de 1 ano para fontes `Plus Jakarta Sans` e `Lora`.
- **IndexedDB:** Guarda devocionais, favoritos e diário localmente.
- **Indicador Offline:** Um pill visual discreto (`WifiOff`) surge no cabeçalho quando a conexão é interrompida, e a sincronização com o backend de notificações ocorre automaticamente quando a rede é restabelecida.
