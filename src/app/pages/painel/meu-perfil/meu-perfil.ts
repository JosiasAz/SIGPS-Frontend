import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { environment } from '../../../env/environment';

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface PerfilCompleto {
  id: number; nome: string; email: string; perfil: string;
  tipoProfissional?: string; especialidade?: string;
  conselho?: string; numeroRegistro?: string; uf?: string; crm?: string;
  foto?: string; sobre?: string; localAtendimento?: string;
  statusVerificacao: 'nao_verificado' | 'em_analise' | 'verificado' | 'rejeitado';
  documentoEnviado: boolean;
  clinicaAdmin?: ClinicaDetalhes | null;
  clinicaVinculada?: { id: number; nome: string; enderecoFormatado: string } | null;
}

interface ClinicaDetalhes {
  id: number; nome: string; tipo: string; cnpj: string; telefone: string;
  emailContato: string; cep: string; rua: string; numero: string;
  complemento: string; bairro: string; cidade: string; estado: string;
  enderecoFormatado: string; statusVerificacao: string;
  especialistas: { id: number; nome: string; especialidade: string; crm: string; statusVerificacao: string }[];
}

// ── Dados de domínio ──────────────────────────────────────────────────────────
const TIPOS_PROFISSIONAL = [
  { tipo: 'Médico',           conselho: 'CRM',     icone: 'M',  cor: '#3b82f6' },
  { tipo: 'Dentista',         conselho: 'CRO',     icone: 'D',  cor: '#8b5cf6' },
  { tipo: 'Enfermeiro(a)',     conselho: 'COREN',   icone: 'E',  cor: '#ec4899' },
  { tipo: 'Psicólogo(a)',     conselho: 'CRP',     icone: 'P',  cor: '#f59e0b' },
  { tipo: 'Fisioterapeuta',   conselho: 'CREFITO', icone: 'F',  cor: '#10b981' },
  { tipo: 'Nutricionista',    conselho: 'CRN',     icone: 'N',  cor: '#06b6d4' },
  { tipo: 'Farmacêutico(a)',  conselho: 'CRF',     icone: 'Fa', cor: '#f97316' },
  { tipo: 'Veterinário(a)',   conselho: 'CRMV',    icone: 'V',  cor: '#84cc16' },
  { tipo: 'Biomédico(a)',     conselho: 'CFBM',    icone: 'B',  cor: '#a855f7' },
  { tipo: 'Outro',            conselho: 'Outro',   icone: '+',  cor: '#6b7280' },
];

const ESPECIALIDADES_POR_CONSELHO: Record<string, string[]> = {
  CRM: [
    'Acupuntura','Alergia e Imunologia','Anestesiologia','Angiologia',
    'Cardiologia','Cirurgia Cardiovascular','Cirurgia da Mão','Cirurgia de Cabeça e Pescoço',
    'Cirurgia do Aparelho Digestivo','Cirurgia Geral','Cirurgia Oncológica','Cirurgia Pediátrica',
    'Cirurgia Plástica','Cirurgia Torácica','Cirurgia Vascular','Clínica Médica',
    'Coloproctologia','Dermatologia','Endocrinologia e Metabologia','Endoscopia',
    'Gastroenterologia','Geriatria','Ginecologia e Obstetrícia','Hematologia',
    'Infectologia','Mastologia','Medicina de Emergência','Medicina de Família e Comunidade',
    'Medicina do Trabalho','Medicina Esportiva','Medicina Física e Reabilitação',
    'Medicina Intensiva','Medicina Legal e Perícia','Medicina Nuclear','Nefrologia',
    'Neurocirurgia','Neurologia','Nutrologia','Oftalmologia','Oncologia Clínica',
    'Ortopedia e Traumatologia','Otorrinolaringologia','Patologia','Pediatria',
    'Pneumologia','Psiquiatria','Radiodiagnóstico','Radioterapia','Reumatologia','Urologia',
  ],
  CRO: [
    'Cirurgia Bucomaxilofacial','Dentística','Disfunção Temporomandibular',
    'Endodontia','Estomatologia','Implantodontia','Odontologia do Trabalho',
    'Odontologia Hospitalar','Odontologia Legal','Odontopediatria',
    'Ortodontia','Ortopedia Funcional dos Maxilares','Patologia Oral',
    'Periodontia','Prótese Dentária','Radiologia Odontológica',
  ],
  COREN: [
    'Enfermagem em Centro Cirúrgico','Enfermagem em Neonatologia',
    'Enfermagem em Obstetrícia','Enfermagem em Saúde Mental',
    'Enfermagem em Terapia Intensiva','Enfermagem Oncológica',
    'Enfermagem Pediátrica','Estomaterapia','Saúde da Família','Saúde do Trabalhador',
  ],
  CRP: [
    'Neuropsicologia','Psicologia Clínica','Psicologia do Esporte',
    'Psicologia do Trânsito','Psicologia Escolar e Educacional',
    'Psicologia Hospitalar','Psicologia Jurídica','Psicologia Organizacional','Psicoterapia',
  ],
  CREFITO: [
    'Acupuntura','Fisioterapia Aquática','Fisioterapia Cardiovascular',
    'Fisioterapia Dermato-Funcional','Fisioterapia em Saúde da Mulher',
    'Fisioterapia Esportiva','Fisioterapia Gerontológica','Fisioterapia Intensivista',
    'Fisioterapia Músculo-esquelética','Fisioterapia Neurológica',
    'Fisioterapia Oncológica','Fisioterapia Respiratória','Fisioterapia Traumato-ortopédica',
    'Saúde do Trabalhador','Terapia Ocupacional',
  ],
  CRN: [
    'Alimentação Coletiva','Nutrição Clínica','Nutrição Esportiva',
    'Nutrição Estética','Nutrição Funcional','Nutrição Materno-Infantil',
    'Nutrição Oncológica','Nutrição em Saúde Pública',
  ],
  CRF: [
    'Farmácia Clínica','Farmácia de Manipulação','Farmácia Estética',
    'Farmácia Homeopática','Farmácia Industrial','Farmácia Oncológica',
    'Farmácia Veterinária','Fitoterapia',
  ],
  CRMV: [
    'Anestesiologia Veterinária','Cardiologia Veterinária','Cirurgia Veterinária',
    'Dermatologia Veterinária','Diagnóstico por Imagem','Fisioterapia Veterinária',
    'Medicina de Animais Selvagens','Neurologia Veterinária','Oftalmologia Veterinária',
    'Oncologia Veterinária','Ortopedia Veterinária','Reprodução Animal',
  ],
  CFBM: [
    'Análises Clínicas','Banco de Sangue','Citologia Clínica',
    'Hematologia','Imunologia','Microbiologia','Parasitologia','Toxicologia',
  ],
  Outro: ['Outra Especialidade'],
};

const TIPOS_CLINICA = ['Clínica', 'Consultório', 'Laboratório', 'Clínica Escola', 'Outro'];

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

// ── Validators ────────────────────────────────────────────────────────────────
function cnpjValidator(ctrl: AbstractControl): ValidationErrors | null {
  const c = (ctrl.value || '').replace(/\D/g, '');
  if (!c) return null;
  if (c.length !== 14 || new Set(c).size === 1) return { cnpjInvalido: true };
  const calc = (c: string, n: number) => {
    const s = Array.from({length: n-1}, (_, i) => parseInt(c[i]) * ((n - i) % 8 + 2)).reduce((a, b) => a + b, 0);
    const r = 11 - s % 11; return r >= 10 ? 0 : r;
  };
  return calc(c, 13) === +c[12] && calc(c, 14) === +c[13] ? null : { cnpjInvalido: true };
}

// ── Componente ────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-meu-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './meu-perfil.html',
  styleUrls: ['./meu-perfil.scss']
})
export class MeuPerfilComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AbstractAuthService);
  private fb = inject(FormBuilder);
  private api = environment.apiUrl;

  readonly tiposProfissional = TIPOS_PROFISSIONAL;
  readonly tiposClinica = TIPOS_CLINICA;
  readonly ufs = UFS;

  // ── Estado geral ──────────────────────────────────────────────────────────
  perfil = signal<PerfilCompleto | null>(null);
  carregando = signal(true);
  salvando = signal(false);
  toast = signal<{tipo: 'sucesso'|'erro'; msg: string} | null>(null);

  get isPaciente() { return this.perfil()?.perfil === 'Paciente'; }
  get isEspecialista() { return this.perfil()?.perfil === 'Especialista'; }
  get statusVerif() { return this.perfil()?.statusVerificacao || 'nao_verificado'; }
  get podeReceberAgendamentos() { return this.statusVerif === 'verificado'; }

  // ── Abas ──────────────────────────────────────────────────────────────────
  abaAtiva = signal<'profissional' | 'clinica'>('profissional');

  // ── Wizard: upgrade Paciente → Especialista ───────────────────────────────
  etapaWizard = signal(1);
  tipoProfSelecionado = signal<typeof TIPOS_PROFISSIONAL[0] | null>(null);

  step1Form: FormGroup;   // tipo profissional
  step2Form: FormGroup;   // dados do registro
  step3Form: FormGroup;   // local de atendimento
  step4Form: FormGroup;   // sobre + confirmação

  // ── Edição do perfil profissional existente ───────────────────────────────
  editProfForm: FormGroup;
  editandoProfissional = signal(false);

  // Signals reativos para rastrear o conselho selecionado em cada contexto
  conselhoWizard = signal('');
  conselhoEdit   = signal('');

  especialidadesWizard = computed(() => ESPECIALIDADES_POR_CONSELHO[this.conselhoWizard()] || []);
  especialidadesEdit   = computed(() => ESPECIALIDADES_POR_CONSELHO[this.conselhoEdit()]   || []);

  // ── Wizard: clínica ───────────────────────────────────────────────────────
  etapaClinica = signal(1);
  step1ClinicaForm: FormGroup;  // tipo + CNPJ + nome
  step2ClinicaForm: FormGroup;  // endereço com CEP
  editandoClinica = signal(false);

  // ── Busca de CEP ─────────────────────────────────────────────────────────
  buscandoCep = signal(false);
  erroCep = signal('');

  // ── Adicionar membro à clínica ────────────────────────────────────────────
  emailNovoMembro = signal('');
  adicionandoMembro = signal(false);
  erroMembro = signal('');

  // ── Upload de documento ───────────────────────────────────────────────────
  arquivoSelecionado = signal<File | null>(null);
  enviandoDoc = signal(false);

  // ── Clínica ───────────────────────────────────────────────────────────────
  clinica = signal<ClinicaDetalhes | null>(null);

  constructor() {
    this.step1Form = this.fb.group({ tipoProfissional: ['', Validators.required] });
    this.step2Form = this.fb.group({
      conselho:       ['', Validators.required],
      numeroRegistro: ['', [Validators.required, Validators.pattern(/^\d{3,6}$/)]],
      uf:             ['', Validators.required],
      especialidade:  ['', Validators.required],
    });
    this.step3Form = this.fb.group({
      cep: [''], rua: [''], numero: [''], complemento: [''],
      bairro: [''], cidade: [''], estado: ['']
    });
    this.step4Form = this.fb.group({ sobre: [''], concordaTermos: [false, Validators.requiredTrue] });

    this.step1ClinicaForm = this.fb.group({
      tipo:  ['Clínica', Validators.required],
      nome:  ['', Validators.required],
      cnpj:  ['', cnpjValidator],
      telefone: [''], emailContato: ['', Validators.email]
    });
    this.step2ClinicaForm = this.fb.group({
      cep: ['', Validators.required], rua: ['', Validators.required],
      numero: ['', Validators.required], complemento: [''],
      bairro: ['', Validators.required], cidade: ['', Validators.required],
      estado: ['', Validators.required]
    });

    this.editProfForm = this.fb.group({
      especialidade:    [''],
      conselho:         [''],
      numeroRegistro:   ['', Validators.pattern(/^\d{3,6}$/)],
      uf:               [''],
      sobre:            [''],
      localAtendimento: ['']
    });
  }

  ngOnInit() {
    this.carregarPerfil();
    // Propaga mudanças do conselho nos FormGroups para os signals reativos
    this.step2Form.get('conselho')!.valueChanges.subscribe(v => this.conselhoWizard.set(v || ''));
    this.editProfForm.get('conselho')!.valueChanges.subscribe(v => this.conselhoEdit.set(v || ''));
  }

  private carregarPerfil() {
    this.carregando.set(true);
    this.http.get<PerfilCompleto>(`${this.api}/api/v1/perfil/me`).subscribe({
      next: (p) => {
        this.perfil.set(p);
        this.carregando.set(false);
        if (p.clinicaAdmin) this.clinica.set(p.clinicaAdmin as ClinicaDetalhes);
        this.editProfForm.patchValue({
          especialidade: p.especialidade || '', conselho: p.conselho || '',
          numeroRegistro: p.numeroRegistro || '', uf: p.uf || '',
          sobre: p.sobre || '', localAtendimento: p.localAtendimento || ''
        });
        // Inicializa o signal com o conselho já salvo no perfil
        this.conselhoEdit.set(p.conselho || '');
        if (p.clinicaAdmin) {
          const c = p.clinicaAdmin;
          this.step1ClinicaForm.patchValue({ tipo: c.tipo, nome: c.nome, cnpj: c.cnpj, telefone: c.telefone, emailContato: c.emailContato });
          this.step2ClinicaForm.patchValue({ cep: c.cep, rua: c.rua, numero: c.numero, complemento: c.complemento, bairro: c.bairro, cidade: c.cidade, estado: c.estado });
        }
      },
      error: () => this.carregando.set(false)
    });
  }

  private showToast(tipo: 'sucesso'|'erro', msg: string) {
    this.toast.set({ tipo, msg });
    setTimeout(() => this.toast.set(null), 4000);
  }

  // ── Wizard Especialista ───────────────────────────────────────────────────
  selecionarTipoProfissional(tp: typeof TIPOS_PROFISSIONAL[0]) {
    this.tipoProfSelecionado.set(tp);
    this.step1Form.patchValue({ tipoProfissional: tp.tipo });
    this.step2Form.patchValue({ conselho: tp.conselho, especialidade: '' });
    this.conselhoWizard.set(tp.conselho);
    setTimeout(() => this.etapaWizard.set(2), 200);
  }

  private _sanitizarNumero(event: Event, max = 6): string {
    const input = event.target as HTMLInputElement;
    const limpo = input.value.replace(/\D/g, '').slice(0, max);
    input.value = limpo;
    return limpo;
  }

  sanitizarNumeroWizard(event: Event) {
    const val = this._sanitizarNumero(event);
    this.step2Form.get('numeroRegistro')?.setValue(val, { emitEvent: false });
    this.step2Form.get('numeroRegistro')?.markAsTouched();
  }

  sanitizarNumeroEdit(event: Event) {
    const val = this._sanitizarNumero(event);
    this.editProfForm.get('numeroRegistro')?.setValue(val, { emitEvent: false });
    this.editProfForm.get('numeroRegistro')?.markAsTouched();
  }

  onConselhoChangeWizard(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.conselhoWizard.set(val);
    this.step2Form.patchValue({ especialidade: '' });
  }

  onConselhoChangeEdit(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.conselhoEdit.set(val);
    this.editProfForm.patchValue({ especialidade: '' });
  }

  // Lista de conselhos únicos para os selects
  get conselhos() {
    return TIPOS_PROFISSIONAL.filter(t => t.conselho !== 'Outro');
  }

  wizardAnterior() { this.etapaWizard.update(e => Math.max(1, e - 1)); }
  wizardProximo() {
    const e = this.etapaWizard();
    if (e === 2 && this.step2Form.invalid) { this.step2Form.markAllAsTouched(); return; }
    this.etapaWizard.update(e => Math.min(4, e + 1));
  }

  concluirUpgrade() {
    if (this.step4Form.invalid) { this.step4Form.markAllAsTouched(); return; }
    this.salvando.set(true);
    const payload = {
      tipoProfissional: this.step1Form.value.tipoProfissional,
      ...this.step2Form.value,
      ...this.step3Form.value,
      sobre: this.step4Form.value.sobre,
      localAtendimento: this._montarEnderecoLocal()
    };
    this.http.post<any>(`${this.api}/api/v1/perfil/tornar-especialista`, payload).subscribe({
      next: (res) => {
        this.salvando.set(false);
        this.perfil.set(res.perfil);
        this.showToast('sucesso', 'Perfil profissional criado! Agora envie seu documento de verificação.');
        this.etapaWizard.set(4);
      },
      error: (e) => { this.salvando.set(false); this.showToast('erro', e.error?.message || 'Erro ao criar perfil.'); }
    });
  }

  private _montarEnderecoLocal(): string {
    const v = this.step3Form.value;
    const partes = [v.rua, v.numero, v.complemento, v.bairro].filter(Boolean).join(', ');
    const local = [v.cidade, v.estado].filter(Boolean).join('/');
    return [partes, local].filter(Boolean).join(' — ');
  }

  // ── Editar perfil profissional ────────────────────────────────────────────
  salvarEditPerfil() {
    this.salvando.set(true);
    this.http.patch<any>(`${this.api}/api/v1/perfil/me`, this.editProfForm.value).subscribe({
      next: (res) => {
        this.salvando.set(false);
        this.perfil.set(res.perfil);
        this.editandoProfissional.set(false);
        this.showToast('sucesso', 'Perfil atualizado com sucesso!');
      },
      error: () => { this.salvando.set(false); this.showToast('erro', 'Erro ao salvar.'); }
    });
  }

  // ── Upload documento ──────────────────────────────────────────────────────
  onArquivoSelecionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.arquivoSelecionado.set(input.files[0]);
  }

  enviarDocumento() {
    const arquivo = this.arquivoSelecionado();
    if (!arquivo) return;
    this.enviandoDoc.set(true);
    const form = new FormData();
    form.append('documento', arquivo);
    this.http.post<any>(`${this.api}/api/v1/perfil/documento`, form).subscribe({
      next: (res) => {
        this.enviandoDoc.set(false);
        this.arquivoSelecionado.set(null);
        this.perfil.update(p => p ? { ...p, statusVerificacao: 'em_analise', documentoEnviado: true } : p);
        this.showToast('sucesso', res.message);
      },
      error: (e) => { this.enviandoDoc.set(false); this.showToast('erro', e.error?.message || 'Erro no upload.'); }
    });
  }

  // ── CEP lookup ────────────────────────────────────────────────────────────
  buscarCep(cep: string, form: FormGroup) {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    this.buscandoCep.set(true);
    this.erroCep.set('');
    this.http.get<any>(`https://viacep.com.br/ws/${clean}/json/`).subscribe({
      next: (data) => {
        this.buscandoCep.set(false);
        if (data.erro) { this.erroCep.set('CEP não encontrado.'); return; }
        form.patchValue({ rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf });
      },
      error: () => { this.buscandoCep.set(false); this.erroCep.set('Erro ao buscar CEP.'); }
    });
  }

  formatarCep(cep: string): string {
    const c = cep.replace(/\D/g, '').slice(0, 8);
    return c.length > 5 ? `${c.slice(0,5)}-${c.slice(5)}` : c;
  }

  // ── Wizard Clínica ────────────────────────────────────────────────────────
  clinicaProximo() {
    if (this.etapaClinica() === 1 && this.step1ClinicaForm.invalid) { this.step1ClinicaForm.markAllAsTouched(); return; }
    if (this.etapaClinica() === 2 && this.step2ClinicaForm.invalid) { this.step2ClinicaForm.markAllAsTouched(); return; }
    this.etapaClinica.update(e => Math.min(3, e + 1));
  }
  clinicaAnterior() { this.etapaClinica.update(e => Math.max(1, e - 1)); }

  criarOuSalvarClinica() {
    const c = this.clinica();
    const payload = { ...this.step1ClinicaForm.value, ...this.step2ClinicaForm.value };
    this.salvando.set(true);
    const req = c
      ? this.http.patch<ClinicaDetalhes>(`${this.api}/api/v1/clinicas/${c.id}`, payload)
      : this.http.post<ClinicaDetalhes>(`${this.api}/api/v1/clinicas/`, payload);

    req.subscribe({
      next: (cl) => {
        this.salvando.set(false);
        this.clinica.set(cl);
        this.perfil.update(p => p ? { ...p, clinicaAdmin: cl } : p);
        this.editandoClinica.set(false);
        this.showToast('sucesso', c ? 'Clínica atualizada! Todos os endereços dos profissionais vinculados foram atualizados.' : 'Clínica criada com sucesso!');
      },
      error: (e) => { this.salvando.set(false); this.showToast('erro', e.error?.message || 'Erro.'); }
    });
  }

  editarClinica() {
    this.editandoClinica.set(true);
    this.etapaClinica.set(1);
  }

  // ── Membros da clínica ────────────────────────────────────────────────────
  adicionarMembro() {
    const email = this.emailNovoMembro().trim();
    const c = this.clinica();
    if (!email || !c) return;
    this.adicionandoMembro.set(true);
    this.erroMembro.set('');
    this.http.post<any>(`${this.api}/api/v1/clinicas/${c.id}/especialistas`, { email }).subscribe({
      next: (res) => {
        this.adicionandoMembro.set(false);
        this.clinica.set(res.clinica);
        this.emailNovoMembro.set('');
        this.showToast('sucesso', res.message);
      },
      error: (e) => { this.adicionandoMembro.set(false); this.erroMembro.set(e.error?.message || 'Erro.'); }
    });
  }

  removerMembro(espId: number) {
    const c = this.clinica();
    if (!c || !confirm('Remover este profissional da clínica?')) return;
    this.http.delete(`${this.api}/api/v1/clinicas/${c.id}/especialistas/${espId}`).subscribe({
      next: () => {
        this.clinica.update(cl => cl ? { ...cl, especialistas: cl.especialistas.filter(e => e.id !== espId) } : cl);
        this.showToast('sucesso', 'Profissional removido.');
      },
      error: () => this.showToast('erro', 'Erro ao remover.')
    });
  }

  // ── Helpers visuais ───────────────────────────────────────────────────────
  statusLabel(s: string) {
    return { nao_verificado: 'Não verificado', em_analise: 'Em análise', verificado: 'Verificado', rejeitado: 'Rejeitado' }[s] || s;
  }
  statusVerifClinica(s: string) {
    return { pendente: 'Pendente', verificada: 'Verificada', rejeitada: 'Rejeitada' }[s] || s;
  }

  etapaWizardPorcentagem = computed(() => Math.round((this.etapaWizard() / 4) * 100));
}
