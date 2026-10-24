const fs = require('fs');
const path = 'src/App.css';
let s = fs.readFileSync(path, 'utf8');

const re = /  \.modal-backdrop \{[\s\S]*?  \.client-modal-header \{\n    padding-bottom: 18px;\n  \}/;
if (!re.test(s)) {
  console.error('pattern not found');
  process.exit(1);
}

const replacement = `  .modal-backdrop {
    padding: 0;
  }
  .project-modal {
    display: flex;
    flex-direction: column;
    grid-template-columns: 1fr;
    grid-template-rows: none;
    width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    overflow: hidden;
    border-radius: 0;
    background: #151413;
  }
  .project-modal-media {
    position: relative;
    flex: 1 1 100%;
    min-height: 0;
    height: 100dvh;
    max-height: 100dvh;
    overflow: hidden;
    background: #151413;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .project-modal-media img {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    max-width: 100vw;
    max-height: 100dvh;
    object-fit: contain;
    vertical-align: top;
    margin: 0;
  }
  .modal-placeholder {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: blur(20px);
  }
  .modal-image {
    display: block;
  }
  .project-modal-detail,
  .project-modal-client,
  .project-modal-meta,
  .modal-back-link {
    display: none !important;
  }
  .close-modal {
    top: calc(env(safe-area-inset-top, 0px) + 10px);
    right: 10px;
    background: rgba(20, 19, 18, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .client-modal {
    max-height: 96vh;
    padding: 48px 20px 26px;
    border-radius: 16px;
  }
  .client-modal-header {
    padding-bottom: 18px;
  }`;

s = s.replace(re, replacement);
fs.writeFileSync(path, s);
console.log('done');
