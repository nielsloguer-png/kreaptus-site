# Kreaptus — Arquitectura & Obras

Site institucional numa só página (HTML + CSS + JavaScript, sem compilação).

## Ver no computador

Com Node.js instalado:

```bash
npm install
npm start
```

Abra http://localhost:5182

Sem Node.js (Windows): `powershell -ExecutionPolicy Bypass -File serve.ps1 -Port 5182`

> Abra sempre através de um servidor local. Se fizer duplo clique no `index.html`, a visita 3D não carrega as imagens.

## Publicar

Não precisa de compilação: carregue a pasta inteira para Netlify, Vercel, Cloudflare Pages ou qualquer alojamento web.
Para a visita 3D carregar depressa, é recomendável um alojamento com CDN.

## Estrutura

| Ficheiro / pasta | Conteúdo |
|---|---|
| `index.html` | Todas as secções do site |
| `style.css` | Estilos (cores da marca: lima `#C6FF34`, violeta `#7A38EC`, azul `#0000FE`, fundo `#0B0B12`) |
| `main.js` | Animações, scroll suave, visita 3D, formulário |
| `assets/img/` | Logótipos e fotografias |
| `assets/walk/` | 481 imagens da visita 3D (desktop 1920 px, mobile 720 px) |
| `assets/esbocos/` | Esboços conceptuais (volumetria, ventilação, iluminação, forma, planta) |
| `assets/parceiros/` | Logótipos dos parceiros (ver `LEIA-ME.txt`) |

## Notas

- O formulário de contacto abre o e-mail do visitante com a mensagem preenchida para kuendi@outlook.com (não precisa de servidor).
- Parceiros: troque cada `<span class="partner__ph">` em `index.html` por `<img src="assets/parceiros/NOME.png" alt="Nome">`.
