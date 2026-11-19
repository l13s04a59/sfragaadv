-- Unified claimant intake table for SFraga Advocacia
-- Applied automatically to local PGlite when DATABASE_URL is unset.
-- On the production host the table already exists; indexes are optional.

CREATE TABLE IF NOT EXISTS reclamante (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  gestante                        boolean NOT NULL,
  form_source                     text NOT NULL
                                  CHECK (form_source IN ('trabalhista', 'gestante')),
  tally_form_id                   text,
  tally_submission_id             text,
  submitted_at                    timestamptz NOT NULL DEFAULT now(),
  raw_payload                     jsonb,
  consentimento_lgpd              boolean NOT NULL DEFAULT false,

  nome_completo                   text,
  telefone                        text,

  caso_mais_de_2_anos             boolean,
  carteira_assinada               boolean,
  prestacao_habitual_subordinada  boolean,
  provas_sem_carteira             text[],
  provas_sem_carteira_outras      text,

  nome_empresa                    text,
  cargo                           text,
  endereco_local_trabalho         text,
  cidade_uf_trabalho              text,
  qtd_funcionarios                integer,
  nome_responsavel                text,
  ja_processou_empresa            boolean,
  recebia_seguro_desemprego       boolean,

  salario_mensal                  text,
  periodicidade_pagamento         text
                                  CHECK (periodicidade_pagamento IS NULL OR periodicidade_pagamento IN (
                                    'dia', 'semana', 'quinzena', 'mes'
                                  )),
  valor_pagamento_periodo         text,
  assinava_recibo                 boolean,
  forma_pagamento                 text
                                  CHECK (forma_pagamento IS NULL OR forma_pagamento IN (
                                    'pix', 'dinheiro', 'deposito_conta', 'outro'
                                  )),
  forma_pagamento_outra           text,
  atividades_descricao            text,

  data_inicio                     date,
  data_inicio_texto               text,
  situacao_trabalho               text
                                  CHECK (situacao_trabalho IS NULL OR situacao_trabalho IN (
                                    'ainda_trabalha',
                                    'dispensado_sem_justa_causa',
                                    'dispensado_com_justa_causa',
                                    'pediu_demissao'
                                  )),
  motivo_quer_pedir_demissao      text,
  data_demissao                   date,
  data_demissao_texto             text,
  recebeu_rescisao                boolean,
  valor_rescisao                  numeric(12, 2),
  motivo_dispensa                 text,
  data_pedido_demissao            text,
  demissao_homologada_sindicato   text
                                  CHECK (demissao_homologada_sindicato IS NULL OR demissao_homologada_sindicato IN (
                                    'sim', 'nao', 'nao_sei'
                                  )),
  motivo_pedido_demissao          text,
  motivo_justa_causa              text,

  horario_inicio                  text,
  horario_saida                   text,
  dias_trabalhados                text[],
  chegava_mais_cedo               boolean,
  horario_chegada_cedo            text,
  motivo_chegada_cedo             text,
  freq_chegada_cedo               text,
  saia_mais_tarde                 boolean,
  horario_saida_tarde             text,
  motivo_saida_tarde              text,
  freq_saida_tarde                text,
  fazia_intervalo_completo        boolean,
  motivo_intervalo_incompleto     text,
  freq_intervalo_incompleto       text,
  tempo_intervalo                 text,

  tinha_cartao_ponto              boolean,
  registrava_cartao_ponto         boolean,
  tipo_registro_ponto             text
                                  CHECK (tipo_registro_ponto IS NULL OR tipo_registro_ponto IN (
                                    'manual', 'eletronico_biometrico', 'aplicativo'
                                  )),
  forma_registro_ponto            text
                                  CHECK (forma_registro_ponto IS NULL OR forma_registro_ponto IN (
                                    'horarios_quebrados', 'horarios_redondos'
                                  )),

  ganhava_insalubridade           text
                                  CHECK (ganhava_insalubridade IS NULL OR ganhava_insalubridade IN (
                                    'sim', 'nao', 'nao_sei'
                                  )),
  percentual_insalubridade        text
                                  CHECK (percentual_insalubridade IS NULL OR percentual_insalubridade IN (
                                    '10', '20', '40', 'nao_sei'
                                  )),
  ganhava_periculosidade          text
                                  CHECK (ganhava_periculosidade IS NULL OR ganhava_periculosidade IN (
                                    'sim', 'nao', 'nao_sei'
                                  )),
  limpava_banheiros               boolean,
  limpava_banheiros_sozinho       boolean,
  usuarios_banheiro               text
                                  CHECK (usuarios_banheiro IS NULL OR usuarios_banheiro IN (
                                    'menos_de_20', 'mais_de_20'
                                  )),
  qtd_vasos_sanitarios_dia        text,
  acessava_camara_fria            boolean,
  calor_excessivo                 boolean,
  agentes_nocivos                 text[],
  agentes_nocivos_tipo            text,
  eletrica_alto_risco             boolean,

  acidente_ou_doenca_trabalho     boolean,
  acidente_doenca_detalhes        text,
  afastou_inss                    boolean,

  vale_alimentacao_refeicao       text
                                  CHECK (vale_alimentacao_refeicao IS NULL OR vale_alimentacao_refeicao IN (
                                    'ambos', 'nenhum', 'apenas_va', 'apenas_vr'
                                  )),
  valor_va_vr                     text,
  meio_transporte                 text
                                  CHECK (meio_transporte IS NULL OR meio_transporte IN (
                                    'a_pe', 'bicicleta', 'conducao_propria',
                                    'transporte_publico_proprio', 'vale_transporte'
                                  )),
  gasto_transporte_mensal         text,
  valor_vale_transporte           text,

  danos_morais                    text,
  observacoes_adicionais          text,

  semanas_gestacao                text,
  informou_gravidez_empresa       boolean,
  data_comunicacao_gravidez       text,
  possui_ultrassom                boolean,
  data_prevista_parto             text,
  ambiente_seguro_gravidez        boolean,
  tarefas_risco_gestacao          boolean,
  quais_tarefas_risco             text,
  discriminacao_por_gravidez      boolean,
  discriminacao_gravidez_detalhes text,
  tem_relato_adicional_gravidez   boolean,
  relato_adicional_gravidez       text,

  created_at                      timestamptz NOT NULL DEFAULT now(),
  updated_at                      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT reclamante_gestante_form_source_chk CHECK (
    (gestante = true  AND form_source = 'gestante')
    OR (gestante = false AND form_source = 'trabalhista')
  )
);

CREATE INDEX IF NOT EXISTS idx_reclamante_gestante
  ON reclamante (gestante);

CREATE INDEX IF NOT EXISTS idx_reclamante_submitted_at
  ON reclamante (submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_reclamante_telefone
  ON reclamante (telefone);

CREATE INDEX IF NOT EXISTS idx_reclamante_tally_submission_id
  ON reclamante (tally_submission_id)
  WHERE tally_submission_id IS NOT NULL;
