# API Index - v0.0.1

Source: local
Generated: 2026-01-14T20:29:01.274Z

Total endpoints: 75

## PAIA & AI

| Method | Path | Summary |
|--------|------|--------|
| POST | `/paia/list-assistants-options` | - |
| POST | `/paia/update-assistant-option` | - |
| POST | `/paia/create-assistant-option` | - |
| POST | `/paia/link-option-to-assistant` | - |
| POST | `/paia/unlink-option-from-assistant` | - |
| GET | `/paia/get-products` | - |
| POST | `/paia/link-product-to-assistant` | - |
| POST | `/paia/unlink-product-from-assistant` | - |
| POST | `/paia/create-custom-assistant` | - |
| POST | `/paia/generate-prompt` | - |
| GET | `/paia/get-permissions` | - |

## Auditor

| Method | Path | Summary |
|--------|------|--------|
| GET | `/autoAudit/get-audits` | - |
| GET | `/autoAudit/get-conversation/{requestId}` | - |
| GET | `/autoAudit/get-last-summary` | - |
| GET | `/autoAudit/get-transcript-for-audit/{auditId}` | - |
| POST | `/auditor/get-auditor-list` | - |
| POST | `/auditor/send-feedback` | - |
| POST | `/auditor/change-lead-management` | - |
| POST | `/auditor/mark-auditories-as-archived` | - |
| POST | `/auditor/mark-auditories-as-not-archived` | - |
| POST | `/auditor/get-auditor-list-for-supervisor` | - |
| POST | `/auditor/get-auditor-list-for-retail` | - |
| POST | `/auditor/get-auditor-list-for-user` | - |
| GET | `/auditor/describe/{requestId}` | - |
| GET | `/auditor/get-conversation-options/{requestId}` | - |
| GET | `/auditor/get-agent-audited-users-list` | - |
| POST | `/autoAudit/agent-audit-lead-recording` | - |

## Dynamic Queues

| Method | Path | Summary |
|--------|------|--------|
| GET | `/queues/list` | - |
| GET | `/queues/rules/list` | - |
| GET | `/queues/rules/create` | - |
| POST | `/queues/rule/{ruleId}` | - |
| GET | `/queues/origins/list` | - |
| POST | `/queues/create` | - |
| POST | `/queues/{queue}/users` | - |
| POST | `/queues/{queue}/groups` | - |
| DELETE | `/queues/{queue}/groups/unlink/{linkId}` | - |
| POST | `/queues/{queue}/users/remove` | - |
| GET | `/queues/{queue}/users/candidates` | - |
| GET | `/queues/{queue}/groups/candidates` | - |
| POST | `/queues/{queue}` | - |
| POST | `/queues/{queue}/rules` | - |
| POST | `/queues/{queue}/origin` | - |
| POST | `/queues/{queue}/origin/edit` | - |
| DELETE | `/queues/{queue}/origin/unlink/{linkId}` | - |
| GET | `/queues/results` | - |
| GET | `/queues/changelog/{queue}` | - |

## Integrations

| Method | Path | Summary |
|--------|------|--------|
| GET | `/campanas` | [AI] Listar campañas |
| GET | `/campanas/search` | [AI] Buscar campañas |
| GET | `/campanas/types` | [AI] Listar tipos de campaña |
| PUT | `/campanas/{id}` | [AI] Actualizar campaña |
| POST | `/campanas/{id}/labels` | [AI] Asignar etiqueta a campaña |
| DELETE | `/campanas/{id}/labels/{labelId}` | [AI] Remover etiqueta de campaña |
| GET | `/hubspot/get-permissions` | - |
| GET | `/hubspot/users` | - |
| GET | `/companies/users` | - |
| POST | `/salesforce/task` | - |
| GET | `/salesforce/schedules/bookable-slots` | - |
| GET | `/salesforce/schedules/user-availability/{userId}` | - |
| POST | `/salesforce/schedules/weekly-availability` | - |
| POST | `/salesforce/schedules/blocked-period` | - |
| POST | `/salesforce/schedules/book-appointment` | - |
| DELETE | `/salesforce/schedules/{scheduleId}` | - |

## Infrastructure

| Method | Path | Summary |
|--------|------|--------|
| GET | `/campaign/media` | - |
| POST | `/myflex/did` | - |
| POST | `/myflex/did/followme` | Edit DID Follow Me configuration |
| GET | `/myflex/customer` | - |
| GET | `/myflex/extension` | - |
| POST | `/myflex/followme` | - |
| GET | `/campaign/products` | - |

## System

| Method | Path | Summary |
|--------|------|--------|
| GET | `/welcome` | - |
| GET | `/secured` | - |
| GET | `/withIdentity` | - |
| POST | `/generate-api-key` | - |
| GET | `/helpCenter/resources` | - |
| GET | `/monitoringPanel/get-panel-list` | - |

