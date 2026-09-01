# Protótipo v0

Arquivo único, React, dados sintéticos determinísticos. Serve como referência visual e
funcional durante a migração — não é código de produção e não deve ser importado.

A migração consiste em extrair, nesta ordem:

1. `projeta()`, `MEDIA_DIARIA`, `COMPROMISSOS` e as agregações → `src/domain`, com testes
2. o gerador de transações → `src/data`
3. os tokens de design (bloco `CSS`) → `src/ui`
4. cada tela → `src/features/<nome>`

Ao final, este arquivo pode ser removido do repositório — o histórico do Git guarda a origem.
