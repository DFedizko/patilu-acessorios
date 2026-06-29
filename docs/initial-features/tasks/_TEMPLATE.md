# RF-XX — <título curto>

> **Template** dos arquivos de subtask. Todo `RF-XX.md` segue exatamente esta estrutura. Um agente deve conseguir implementar o RF lendo só este arquivo + as seções referenciadas da PRD/TECH_SPEC.

| | |
| --- | --- |
| **Tipo** | back-end \| **front-end** |
| **Onda** | 0 / 1 / 2 / 3 / adiado |
| **Depende de** | RF-YY, RF-ZZ (devem estar `DONE` em `progress-claude.txt`) |
| **Habilita** | RF-AA, RF-BB |
| **Hotspots tocados** | ex.: `src/server/di/container.ts`, `src/lib/schemas.ts`, `src/lib/openapi.ts` |

## 1. Objetivo (o que este RF entrega)

Uma frase de resultado de negócio + uma de resultado técnico.

## 2. Contexto (por quê)

Por que este RF existe e como se encaixa no produto. Referência ao problema da loja quando útil.

## 3. Início — pré-condições (o que já precisa existir)

Lista verificável do que deve estar pronto no repo antes de começar (artefatos de RFs anteriores). Como conferir.

## 4. Escopo — entregáveis (faça exatamente isto)

Lista de arquivos a criar/editar com o papel de cada um. Caminhos concretos. Assinaturas/contratos quando a spec já define.

### Fora do escopo (NÃO faça)

O que pertence a outro RF e deve ser deixado de fora (evita sobreposição).

## 5. Fim — Definition of Done

Critérios objetivos de conclusão (além das regras gerais do README).

## 6. Testes que cobrem este RF (§14.2)

Tabela/lista dos testes (integração `*.test` e/ou unidade `*.spec`) que provam o RF de ponta a ponta. RFs `(front)`: "não há testes automatizados".

## 7. Trecho da PRD que fala deste RF

> Citação literal da seção relevante da PRD (Fx / RN-x.y / Dxx).

## 8. Trecho da TECH_SPEC que fala deste RF

> Citação literal das seções relevantes da TECH_SPEC (§x.y, TSxx, tabelas).

## 9. Referências

Links para PRD/TECH_SPEC/CLAUDE.md e guias do Next quando o RF mexe em framework.
