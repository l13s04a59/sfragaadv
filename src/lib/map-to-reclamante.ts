import type { Answers, FormSource } from "./form-types";
import { asMulti, isSim } from "./options";

function boolOrNull(v: unknown): boolean | null {
  if (v === "sim" || v === true) return true;
  if (v === "nao" || v === false) return false;
  return null;
}

function textOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function intOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function numericOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const cleaned = String(v).replace(/[^\d,.-]/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function dateOrNull(v: unknown): string | null {
  const s = textOrNull(v);
  if (!s) return null;
  // already ISO yyyy-mm-dd from date input
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

function textArrayOrNull(v: unknown): string[] | null {
  const arr = asMulti(v);
  return arr.length ? arr : null;
}

export type ReclamanteRow = {
  id: string;
  gestante: boolean;
  form_source: FormSource;
  submitted_at: string;
  raw_payload: Answers & { form_source: FormSource; gestante: boolean; early_exit?: boolean };
  consentimento_lgpd: boolean;
  nome_completo: string | null;
  telefone: string | null;
  caso_mais_de_2_anos: boolean | null;
  carteira_assinada: boolean | null;
  prestacao_habitual_subordinada: boolean | null;
  provas_sem_carteira: string[] | null;
  provas_sem_carteira_outras: string | null;
  nome_empresa: string | null;
  cargo: string | null;
  endereco_local_trabalho: string | null;
  cidade_uf_trabalho: string | null;
  qtd_funcionarios: number | null;
  nome_responsavel: string | null;
  ja_processou_empresa: boolean | null;
  recebia_seguro_desemprego: boolean | null;
  salario_mensal: string | null;
  periodicidade_pagamento: string | null;
  valor_pagamento_periodo: string | null;
  assinava_recibo: boolean | null;
  forma_pagamento: string | null;
  forma_pagamento_outra: string | null;
  atividades_descricao: string | null;
  data_inicio: string | null;
  data_inicio_texto: string | null;
  situacao_trabalho: string | null;
  motivo_quer_pedir_demissao: string | null;
  data_demissao: string | null;
  data_demissao_texto: string | null;
  recebeu_rescisao: boolean | null;
  valor_rescisao: number | null;
  motivo_dispensa: string | null;
  data_pedido_demissao: string | null;
  demissao_homologada_sindicato: string | null;
  motivo_pedido_demissao: string | null;
  motivo_justa_causa: string | null;
  horario_inicio: string | null;
  horario_saida: string | null;
  dias_trabalhados: string[] | null;
  chegava_mais_cedo: boolean | null;
  horario_chegada_cedo: string | null;
  motivo_chegada_cedo: string | null;
  freq_chegada_cedo: string | null;
  saia_mais_tarde: boolean | null;
  horario_saida_tarde: string | null;
  motivo_saida_tarde: string | null;
  freq_saida_tarde: string | null;
  fazia_intervalo_completo: boolean | null;
  motivo_intervalo_incompleto: string | null;
  freq_intervalo_incompleto: string | null;
  tempo_intervalo: string | null;
  tinha_cartao_ponto: boolean | null;
  registrava_cartao_ponto: boolean | null;
  tipo_registro_ponto: string | null;
  forma_registro_ponto: string | null;
  ganhava_insalubridade: string | null;
  percentual_insalubridade: string | null;
  ganhava_periculosidade: string | null;
  limpava_banheiros: boolean | null;
  limpava_banheiros_sozinho: boolean | null;
  usuarios_banheiro: string | null;
  qtd_vasos_sanitarios_dia: string | null;
  acessava_camara_fria: boolean | null;
  calor_excessivo: boolean | null;
  agentes_nocivos: string[] | null;
  agentes_nocivos_tipo: string | null;
  eletrica_alto_risco: boolean | null;
  acidente_ou_doenca_trabalho: boolean | null;
  acidente_doenca_detalhes: string | null;
  afastou_inss: boolean | null;
  vale_alimentacao_refeicao: string | null;
  valor_va_vr: string | null;
  meio_transporte: string | null;
  gasto_transporte_mensal: string | null;
  valor_vale_transporte: string | null;
  danos_morais: string | null;
  observacoes_adicionais: string | null;
  semanas_gestacao: string | null;
  informou_gravidez_empresa: boolean | null;
  data_comunicacao_gravidez: string | null;
  possui_ultrassom: boolean | null;
  data_prevista_parto: string | null;
  ambiente_seguro_gravidez: boolean | null;
  tarefas_risco_gestacao: boolean | null;
  quais_tarefas_risco: string | null;
  discriminacao_por_gravidez: boolean | null;
  discriminacao_gravidez_detalhes: string | null;
  tem_relato_adicional_gravidez: boolean | null;
  relato_adicional_gravidez: string | null;
};

export function mapAnswersToReclamante(
  answers: Answers,
  source: FormSource,
  earlyExit = false,
  id = crypto.randomUUID(),
): ReclamanteRow {
  const gestante = source === "gestante";
  const consent = isSim(answers.consentimento_lgpd);

  return {
    id,
    gestante,
    form_source: source,
    submitted_at: new Date().toISOString(),
    raw_payload: { ...answers, form_source: source, gestante, early_exit: earlyExit },
    consentimento_lgpd: consent,
    nome_completo: textOrNull(answers.nome_completo),
    telefone: textOrNull(answers.telefone),
    caso_mais_de_2_anos: boolOrNull(answers.caso_mais_de_2_anos),
    carteira_assinada: boolOrNull(answers.carteira_assinada),
    prestacao_habitual_subordinada: boolOrNull(answers.prestacao_habitual_subordinada),
    provas_sem_carteira: textArrayOrNull(answers.provas_sem_carteira),
    provas_sem_carteira_outras: textOrNull(answers.provas_sem_carteira_outras),
    nome_empresa: textOrNull(answers.nome_empresa),
    cargo: textOrNull(answers.cargo),
    endereco_local_trabalho: textOrNull(answers.endereco_local_trabalho),
    cidade_uf_trabalho: textOrNull(answers.cidade_uf_trabalho),
    qtd_funcionarios: intOrNull(answers.qtd_funcionarios),
    nome_responsavel: textOrNull(answers.nome_responsavel),
    ja_processou_empresa: boolOrNull(answers.ja_processou_empresa),
    recebia_seguro_desemprego: boolOrNull(answers.recebia_seguro_desemprego),
    salario_mensal: textOrNull(answers.salario_mensal),
    periodicidade_pagamento: textOrNull(answers.periodicidade_pagamento),
    valor_pagamento_periodo: textOrNull(answers.valor_pagamento_periodo),
    assinava_recibo: boolOrNull(answers.assinava_recibo),
    forma_pagamento: textOrNull(answers.forma_pagamento),
    forma_pagamento_outra: textOrNull(answers.forma_pagamento_outra),
    atividades_descricao: textOrNull(answers.atividades_descricao),
    data_inicio: dateOrNull(answers.data_inicio),
    data_inicio_texto: textOrNull(answers.data_inicio_texto),
    situacao_trabalho: textOrNull(answers.situacao_trabalho),
    motivo_quer_pedir_demissao: textOrNull(answers.motivo_quer_pedir_demissao),
    data_demissao: dateOrNull(answers.data_demissao),
    data_demissao_texto: textOrNull(answers.data_demissao_texto),
    recebeu_rescisao: boolOrNull(answers.recebeu_rescisao),
    valor_rescisao: numericOrNull(answers.valor_rescisao),
    motivo_dispensa: textOrNull(answers.motivo_dispensa),
    data_pedido_demissao: textOrNull(answers.data_pedido_demissao),
    demissao_homologada_sindicato: textOrNull(answers.demissao_homologada_sindicato),
    motivo_pedido_demissao: textOrNull(answers.motivo_pedido_demissao),
    motivo_justa_causa: textOrNull(answers.motivo_justa_causa),
    horario_inicio: textOrNull(answers.horario_inicio),
    horario_saida: textOrNull(answers.horario_saida),
    dias_trabalhados: textArrayOrNull(answers.dias_trabalhados),
    chegava_mais_cedo: boolOrNull(answers.chegava_mais_cedo),
    horario_chegada_cedo: textOrNull(answers.horario_chegada_cedo),
    motivo_chegada_cedo: textOrNull(answers.motivo_chegada_cedo),
    freq_chegada_cedo: textOrNull(answers.freq_chegada_cedo),
    saia_mais_tarde: boolOrNull(answers.saia_mais_tarde),
    horario_saida_tarde: textOrNull(answers.horario_saida_tarde),
    motivo_saida_tarde: textOrNull(answers.motivo_saida_tarde),
    freq_saida_tarde: textOrNull(answers.freq_saida_tarde),
    fazia_intervalo_completo: boolOrNull(answers.fazia_intervalo_completo),
    motivo_intervalo_incompleto: textOrNull(answers.motivo_intervalo_incompleto),
    freq_intervalo_incompleto: textOrNull(answers.freq_intervalo_incompleto),
    tempo_intervalo: textOrNull(answers.tempo_intervalo),
    tinha_cartao_ponto: boolOrNull(answers.tinha_cartao_ponto),
    registrava_cartao_ponto: boolOrNull(answers.registrava_cartao_ponto),
    tipo_registro_ponto: textOrNull(answers.tipo_registro_ponto),
    forma_registro_ponto: textOrNull(answers.forma_registro_ponto),
    ganhava_insalubridade: textOrNull(answers.ganhava_insalubridade),
    percentual_insalubridade: textOrNull(answers.percentual_insalubridade),
    ganhava_periculosidade: textOrNull(answers.ganhava_periculosidade),
    limpava_banheiros: boolOrNull(answers.limpava_banheiros),
    limpava_banheiros_sozinho: boolOrNull(answers.limpava_banheiros_sozinho),
    usuarios_banheiro: textOrNull(answers.usuarios_banheiro),
    qtd_vasos_sanitarios_dia: textOrNull(answers.qtd_vasos_sanitarios_dia),
    acessava_camara_fria: boolOrNull(answers.acessava_camara_fria),
    calor_excessivo: boolOrNull(answers.calor_excessivo),
    agentes_nocivos: textArrayOrNull(answers.agentes_nocivos),
    agentes_nocivos_tipo: textOrNull(answers.agentes_nocivos_tipo),
    eletrica_alto_risco: boolOrNull(answers.eletrica_alto_risco),
    acidente_ou_doenca_trabalho: boolOrNull(answers.acidente_ou_doenca_trabalho),
    acidente_doenca_detalhes: textOrNull(answers.acidente_doenca_detalhes),
    afastou_inss: boolOrNull(answers.afastou_inss),
    vale_alimentacao_refeicao: textOrNull(answers.vale_alimentacao_refeicao),
    valor_va_vr: textOrNull(answers.valor_va_vr),
    meio_transporte: textOrNull(answers.meio_transporte),
    gasto_transporte_mensal: textOrNull(answers.gasto_transporte_mensal),
    valor_vale_transporte: textOrNull(answers.valor_vale_transporte),
    danos_morais: gestante ? null : textOrNull(answers.danos_morais),
    observacoes_adicionais: gestante ? null : textOrNull(answers.observacoes_adicionais),
    semanas_gestacao: gestante ? textOrNull(answers.semanas_gestacao) : null,
    informou_gravidez_empresa: gestante ? boolOrNull(answers.informou_gravidez_empresa) : null,
    data_comunicacao_gravidez: gestante ? textOrNull(answers.data_comunicacao_gravidez) : null,
    possui_ultrassom: gestante ? boolOrNull(answers.possui_ultrassom) : null,
    data_prevista_parto: gestante ? textOrNull(answers.data_prevista_parto) : null,
    ambiente_seguro_gravidez: gestante ? boolOrNull(answers.ambiente_seguro_gravidez) : null,
    tarefas_risco_gestacao: gestante ? boolOrNull(answers.tarefas_risco_gestacao) : null,
    quais_tarefas_risco: gestante ? textOrNull(answers.quais_tarefas_risco) : null,
    discriminacao_por_gravidez: gestante ? boolOrNull(answers.discriminacao_por_gravidez) : null,
    discriminacao_gravidez_detalhes: gestante
      ? textOrNull(answers.discriminacao_gravidez_detalhes)
      : null,
    tem_relato_adicional_gravidez: gestante
      ? boolOrNull(answers.tem_relato_adicional_gravidez)
      : null,
    relato_adicional_gravidez: gestante ? textOrNull(answers.relato_adicional_gravidez) : null,
  };
}

export const INSERT_COLUMNS = [
  "id",
  "gestante",
  "form_source",
  "submitted_at",
  "raw_payload",
  "consentimento_lgpd",
  "nome_completo",
  "telefone",
  "caso_mais_de_2_anos",
  "carteira_assinada",
  "prestacao_habitual_subordinada",
  "provas_sem_carteira",
  "provas_sem_carteira_outras",
  "nome_empresa",
  "cargo",
  "endereco_local_trabalho",
  "cidade_uf_trabalho",
  "qtd_funcionarios",
  "nome_responsavel",
  "ja_processou_empresa",
  "recebia_seguro_desemprego",
  "salario_mensal",
  "periodicidade_pagamento",
  "valor_pagamento_periodo",
  "assinava_recibo",
  "forma_pagamento",
  "forma_pagamento_outra",
  "atividades_descricao",
  "data_inicio",
  "data_inicio_texto",
  "situacao_trabalho",
  "motivo_quer_pedir_demissao",
  "data_demissao",
  "data_demissao_texto",
  "recebeu_rescisao",
  "valor_rescisao",
  "motivo_dispensa",
  "data_pedido_demissao",
  "demissao_homologada_sindicato",
  "motivo_pedido_demissao",
  "motivo_justa_causa",
  "horario_inicio",
  "horario_saida",
  "dias_trabalhados",
  "chegava_mais_cedo",
  "horario_chegada_cedo",
  "motivo_chegada_cedo",
  "freq_chegada_cedo",
  "saia_mais_tarde",
  "horario_saida_tarde",
  "motivo_saida_tarde",
  "freq_saida_tarde",
  "fazia_intervalo_completo",
  "motivo_intervalo_incompleto",
  "freq_intervalo_incompleto",
  "tempo_intervalo",
  "tinha_cartao_ponto",
  "registrava_cartao_ponto",
  "tipo_registro_ponto",
  "forma_registro_ponto",
  "ganhava_insalubridade",
  "percentual_insalubridade",
  "ganhava_periculosidade",
  "limpava_banheiros",
  "limpava_banheiros_sozinho",
  "usuarios_banheiro",
  "qtd_vasos_sanitarios_dia",
  "acessava_camara_fria",
  "calor_excessivo",
  "agentes_nocivos",
  "agentes_nocivos_tipo",
  "eletrica_alto_risco",
  "acidente_ou_doenca_trabalho",
  "acidente_doenca_detalhes",
  "afastou_inss",
  "vale_alimentacao_refeicao",
  "valor_va_vr",
  "meio_transporte",
  "gasto_transporte_mensal",
  "valor_vale_transporte",
  "danos_morais",
  "observacoes_adicionais",
  "semanas_gestacao",
  "informou_gravidez_empresa",
  "data_comunicacao_gravidez",
  "possui_ultrassom",
  "data_prevista_parto",
  "ambiente_seguro_gravidez",
  "tarefas_risco_gestacao",
  "quais_tarefas_risco",
  "discriminacao_por_gravidez",
  "discriminacao_gravidez_detalhes",
  "tem_relato_adicional_gravidez",
  "relato_adicional_gravidez",
] as const;

export function rowToParams(row: ReclamanteRow): unknown[] {
  return INSERT_COLUMNS.map((col) => {
    const value = row[col];
    if (col === "raw_payload") return JSON.stringify(value);
    return value;
  });
}
