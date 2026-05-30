import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { environment } from '../../../env/environment';
import { resolveMediaUrl } from '../../../utils/media-url';
import { PerfilService } from '../../../services/perfil/perfil.service';

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface PerfilCompleto {
  id: number; nome: string; email: string; perfil: string; genero?: string;
  tipoProfissional?: string; especialidade?: string;
  conselho?: string; numeroRegistro?: string; uf?: string; crm?: string;
  foto?: string; sobre?: string; localAtendimento?: string;
  statusVerificacao: 'nao_verificado' | 'em_analise' | 'verificado' | 'rejeitado';
  documentoEnviado: boolean;
  clinicaAdmin?: ClinicaDetalhes | null;
  clinicaVinculada?: { id: number; nome: string; enderecoFormatado: string } | null;
  pacienteInfo?: {
    cpf?: string;
    dataNascimento?: string;
    telefone?: string;
    tipoSanguineo?: string;
    comorbidades?: string;
    alergias?: string;
  } | null;
}

interface ClinicaDetalhes {
  id: number; nome: string; tipo: string; cnpj: string; telefone: string;
  emailContato: string; cep: string; rua: string; numero: string;
  complemento: string; bairro: string; cidade: string; estado: string;
  enderecoFormatado: string; statusVerificacao: string; foto?: string;
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
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return { cnpjInvalido: true };

  const digito = (base: string, pesos: number[]) => {
    const soma = pesos.reduce((acc, peso, i) => acc + parseInt(base[i], 10) * peso, 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const dv1 = digito(c, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = digito(c, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return dv1 === +c[12] && dv2 === +c[13] ? null : { cnpjInvalido: true };
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private perfilService = inject(PerfilService);
  private api = environment.apiUrl;

  readonly tiposProfissional = TIPOS_PROFISSIONAL;
  readonly tiposClinica = TIPOS_CLINICA;
  readonly ufs = UFS;

  // ── Estado geral ──────────────────────────────────────────────────────────
  perfil = signal<PerfilCompleto | null>(null);
  carregando = signal(true);
  salvando = signal(false);
  enviandoFoto = signal(false);
  enviandoFotoClinica = signal(false);
  toast = signal<{tipo: 'sucesso'|'erro'; msg: string} | null>(null);

  // ── Transição de upgrade ──────────────────────────────────────────────────
  transicaoAtiva = signal(false);
  transicaoStatus = signal('Processando...');
  transicaoProgresso = signal(0);

  get isPaciente() { return this.perfil()?.perfil === 'Paciente'; }
  get isEspecialista() { return this.perfil()?.perfil === 'Especialista'; }
  get isGestor() { return this.perfil()?.perfil === 'Gestor'; }
  get podeGerirClinica() { return this.isEspecialista || this.isGestor; }
  get statusVerif() { return this.perfil()?.statusVerificacao || 'nao_verificado'; }
  get podeReceberAgendamentos() { return this.statusVerif === 'verificado'; }

  fotoPerfil = computed(() => {
    const p = this.perfil();
    const url = resolveMediaUrl(p?.foto);
    if (url) return url;
    const nome = encodeURIComponent(p?.nome || 'U');
    return `https://ui-avatars.com/api/?name=${nome}&background=166534&color=fff&size=200`;
  });

  fotoClinica = computed(() => {
    const c = this.clinica();
    const url = resolveMediaUrl(c?.foto);
    if (url) return url;
    const nome = encodeURIComponent(c?.nome || 'Clinica');
    return `https://ui-avatars.com/api/?name=${nome}&background=419640&color=fff&size=256&bold=true`;
  });

  // ── Abas ──────────────────────────────────────────────────────────────────
  abaAtiva = signal<'profissional' | 'clinica' | 'paciente'>('profissional');

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

  // ── Edição da Ficha Médica do Paciente ──────────────────────────────────
  fichaMedicaForm: FormGroup;
  editandoFichaMedica = signal(false);

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
  pendingInvites = signal<any[]>([]);

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
    this.step4Form = this.fb.group({
      sobre: ['', [Validators.required, Validators.minLength(20)]],
      concordaTermos: [false, Validators.requiredTrue],
      autonomo: [false]
    });

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

    this.fichaMedicaForm = this.fb.group({
      nome:           ['', Validators.required],
      genero:         ['', Validators.required],
      cpf:            ['', [Validators.required, Validators.pattern(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)]],
      dataNascimento: ['', Validators.required],
      telefone:       [''],
      tipoSanguineo:  [''],
      comorbidades:   [''],
      alergias:       ['']
    });
  }

  ngOnInit() {
    const cached = this.perfilService.perfil();
    if (cached) {
      this.processarPerfil(cached as unknown as PerfilCompleto, false);
      this.carregando.set(false);
      this.carregarPerfil(true);
    } else {
      this.carregarPerfil();
    }
    this.carregarConvites();
    this.step2Form.get('conselho')!.valueChanges.subscribe(v => this.conselhoWizard.set(v || ''));
    this.editProfForm.get('conselho')!.valueChanges.subscribe(v => this.conselhoEdit.set(v || ''));

    this.route.queryParams.subscribe(params => {
      this.aplicarAbaDaUrl(params['aba']);
    });
  }

  private aplicarAbaDaUrl(aba: string | undefined) {
    if (aba === 'clinica' && this.podeGerirClinica) {
      this.abaAtiva.set('clinica');
    } else if (aba === 'conta' || aba === 'profissional') {
      this.abaAtiva.set('profissional');
    } else if (aba === 'paciente' && this.isPaciente) {
      this.abaAtiva.set('paciente');
    }
  }

  selecionarAba(aba: 'profissional' | 'clinica' | 'paciente') {
    this.abaAtiva.set(aba);
    this.editandoClinica.set(false);
    this.editandoProfissional.set(false);

    const queryParams: Record<string, string | null> = {
      aba: aba === 'clinica' ? 'clinica' : aba === 'paciente' ? 'paciente' : 'conta',
    };
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl: true });

    setTimeout(() => {
      document.getElementById('conteudo-abas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  carregarConvites() {
    this.http.get<any[]>(`${this.api}/api/v1/organizations/invites/pending`).subscribe({
      next: (invs) => this.pendingInvites.set(invs),
      error: (e) => console.error('Erro ao carregar convites:', e)
    });
  }

  aceitarConvite(token: string) {
    this.http.post<any>(`${this.api}/api/v1/organizations/invites/accept`, { token }).subscribe({
      next: () => {
        this.showToast('sucesso', 'Convite aceito com sucesso!');
        this.authService.loadOrganizations().subscribe(() => this.carregarPerfil(true, true));
      },
      error: (e) => this.showToast('erro', e.error?.message || 'Erro ao aceitar convite.')
    });
  }

  private mesclarPerfilResposta(atualizado: PerfilCompleto): void {
    this.perfil.update(p => {
      if (!p) return atualizado;
      const merged: PerfilCompleto = { ...p, ...atualizado };
      if (p.clinicaAdmin?.especialistas?.length && !atualizado.clinicaAdmin?.especialistas?.length) {
        merged.clinicaAdmin = { ...merged.clinicaAdmin!, especialistas: p.clinicaAdmin.especialistas };
      }
      return merged;
    });
  }

  private processarPerfil(p: PerfilCompleto, silencioso: boolean): void {
    this.perfil.set(p);
    if (p.clinicaAdmin) this.clinica.set(p.clinicaAdmin as ClinicaDetalhes);
    this.editProfForm.patchValue({
      especialidade: p.especialidade || '', conselho: p.conselho || '',
      numeroRegistro: p.numeroRegistro || '', uf: p.uf || '',
      sobre: p.sobre || '', localAtendimento: p.localAtendimento || ''
    });
    this.conselhoEdit.set(p.conselho || '');
    if (!silencioso) {
      const abaUrl = this.route.snapshot.queryParams['aba'];
      if (abaUrl) {
        this.aplicarAbaDaUrl(abaUrl);
      } else if (p.perfil === 'Paciente') {
        this.abaAtiva.set('paciente');
      } else if (this.podeGerirClinica && p.clinicaAdmin) {
        this.abaAtiva.set('clinica');
      } else {
        this.abaAtiva.set('profissional');
      }
    }

    if (p.perfil === 'Paciente') {
      this.popularFormPaciente(p);
    }

    if (p.clinicaAdmin) {
      const c = p.clinicaAdmin;
      this.step1ClinicaForm.patchValue({ tipo: c.tipo, nome: c.nome, cnpj: c.cnpj, telefone: c.telefone, emailContato: c.emailContato });
      this.step2ClinicaForm.patchValue({ cep: c.cep, rua: c.rua, numero: c.numero, complemento: c.complemento, bairro: c.bairro, cidade: c.cidade, estado: c.estado });
    }
  }

  private carregarPerfil(silencioso = false, force = false) {
    if (!silencioso) this.carregando.set(true);
    this.perfilService.getMe(force).subscribe({
      next: (raw) => {
        this.processarPerfil(raw as unknown as PerfilCompleto, silencioso);
        this.carregando.set(false);
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
    if (e === 1 && this.step1Form.invalid) { this.step1Form.markAllAsTouched(); return; }
    if (e === 2 && this.step2Form.invalid) { this.step2Form.markAllAsTouched(); return; }
    if (e === 3) {
      const cep = this.step3Form.get('cep')?.value;
      const rua = this.step3Form.get('rua')?.value;
      const numero = this.step3Form.get('numero')?.value;
      const bairro = this.step3Form.get('bairro')?.value;
      const cidade = this.step3Form.get('cidade')?.value;
      const estado = this.step3Form.get('estado')?.value;
      
      if (cep || rua || numero || bairro || cidade || estado) {
        let temErro = false;
        ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'].forEach(field => {
          const ctrl = this.step3Form.get(field);
          if (!ctrl?.value) {
            ctrl?.setErrors({ required: true });
            ctrl?.markAsTouched();
            temErro = true;
          }
        });
        if (temErro) return;
      }
    }
    this.etapaWizard.update(e => Math.min(4, e + 1));
  }

  pularEtapa3() {
    this.step3Form.reset({
      cep: '', rua: '', numero: '', complemento: '',
      bairro: '', cidade: '', estado: ''
    });
    this.etapaWizard.set(4);
  }

  concluirUpgrade() {
    if (this.step4Form.invalid) { this.step4Form.markAllAsTouched(); return; }
    this.salvando.set(true);
    const payload = {
      tipoProfissional: this.step1Form.value.tipoProfissional,
      ...this.step2Form.value,
      ...this.step3Form.value,
      sobre: this.step4Form.value.sobre,
      autonomo: this.step4Form.value.autonomo,
      localAtendimento: this._montarEnderecoLocal()
    };
    this.http.post<any>(`${this.api}/api/v1/perfil/tornar-especialista`, payload).subscribe({
      next: (res) => {
        this.salvando.set(false);
        this.iniciarTransicaoUpgrade(res.perfil);
      },
      error: (e) => { this.salvando.set(false); this.showToast('erro', e.error?.message || 'Erro ao criar perfil.'); }
    });
  }

  iniciarTransicaoUpgrade(perfilUpgrade: any) {
    this.transicaoAtiva.set(true);
    this.transicaoStatus.set('Salvando perfil profissional...');
    this.transicaoProgresso.set(30);

    setTimeout(() => {
      this.transicaoStatus.set('Atualizando permissões de acesso...');
      this.transicaoProgresso.set(60);
      this.authService.updateUserRole('especialista');
      this.perfil.set(perfilUpgrade);
    }, 400);

    setTimeout(() => {
      this.transicaoStatus.set('Concluído! Carregando...');
      this.transicaoProgresso.set(100);
      this.transicaoAtiva.set(false);
      this.router.navigate(['/painel/dashboard']);
    }, 1200);
  }

  private _montarEnderecoLocal(): string {
    const v = this.step3Form.value;
    const partes = [v.rua, v.numero, v.complemento, v.bairro].filter(Boolean).join(', ');
    const local = [v.cidade, v.estado].filter(Boolean).join('/');
    return [partes, local].filter(Boolean).join(' — ');
  }

  // ── Editar perfil profissional ────────────────────────────────────────────
  salvarEditPerfil() {
    const formVal = this.editProfForm.value;
    this.perfil.update(p => p ? { ...p, ...formVal } : p);
    this.salvando.set(true);
    this.http.patch<any>(`${this.api}/api/v1/perfil/me`, formVal).subscribe({
      next: (res) => {
        this.salvando.set(false);
        this.mesclarPerfilResposta(res.perfil);
        this.editandoProfissional.set(false);
        this.showToast('sucesso', 'Perfil atualizado com sucesso!');
      },
      error: () => { this.salvando.set(false); this.showToast('erro', 'Erro ao salvar.'); }
    });
  }

  private popularFormPaciente(p: PerfilCompleto) {
    let dataNascFormatada = '';
    if (p.pacienteInfo?.dataNascimento) {
      const parts = p.pacienteInfo.dataNascimento.split('-');
      if (parts.length === 3) {
        dataNascFormatada = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    let cpfFormatado = p.pacienteInfo?.cpf || '';
    if (cpfFormatado && cpfFormatado.length === 11) {
      cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    let telFormatado = p.pacienteInfo?.telefone || '';
    if (telFormatado) {
      const cleanTel = telFormatado.replace(/\D/g, '');
      if (cleanTel.length === 11) {
        telFormatado = cleanTel.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
      } else if (cleanTel.length === 10) {
        telFormatado = cleanTel.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
      }
    }

    this.fichaMedicaForm.patchValue({
      nome: p.nome || '',
      genero: p.genero ? p.genero.toLowerCase() : '',
      cpf: cpfFormatado,
      dataNascimento: dataNascFormatada,
      telefone: telFormatado,
      tipoSanguineo: p.pacienteInfo?.tipoSanguineo || '',
      comorbidades: p.pacienteInfo?.comorbidades || '',
      alergias: p.pacienteInfo?.alergias || ''
    });
  }

  // ── Editar Ficha Médica (Paciente) ────────────────────────────────────────
  salvarFichaMedica() {
    const formVal = this.fichaMedicaForm.value;

    let dataNascimentoISO = '';
    if (formVal.dataNascimento && formVal.dataNascimento.includes('/')) {
      const [dia, mes, ano] = formVal.dataNascimento.split('/');
      dataNascimentoISO = `${ano}-${mes}-${dia}`;
    } else {
      dataNascimentoISO = formVal.dataNascimento;
    }

    const payload = { ...formVal, dataNascimento: dataNascimentoISO };

    this.perfil.update(p => p ? {
      ...p,
      nome: formVal.nome,
      genero: formVal.genero,
      pacienteInfo: {
        ...p.pacienteInfo,
        cpf: formVal.cpf,
        telefone: formVal.telefone,
        tipoSanguineo: formVal.tipoSanguineo,
        comorbidades: formVal.comorbidades,
        alergias: formVal.alergias,
        dataNascimento: dataNascimentoISO
      }
    } : p);
    if (formVal.nome) this.authService.updateDisplayName(formVal.nome);

    this.salvando.set(true);
    this.http.patch<any>(`${this.api}/api/v1/perfil/me`, payload).subscribe({
      next: (res) => {
        this.salvando.set(false);
        this.mesclarPerfilResposta(res.perfil);
        this.popularFormPaciente(res.perfil);
        this.editandoFichaMedica.set(false);
        this.showToast('sucesso', 'Ficha médica atualizada com sucesso!');
      },
      error: () => { this.salvando.set(false); this.showToast('erro', 'Erro ao salvar ficha.'); }
    });
  }

  formatarCpfPaciente(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 11);
    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }
    input.value = value;
    this.fichaMedicaForm.get('cpf')?.setValue(value, { emitEvent: false });
  }

  formatarTelefonePaciente(event: Event) {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    if (v.length > 9) v = v.replace(/(\d)(\d{4})$/, '$1-$2');
    else if (v.length > 5) v = v.replace(/(\d)(\d{4})$/, '$1-$2');
    input.value = v;
    this.fichaMedicaForm.get('telefone')?.setValue(v, { emitEvent: false });
  }

  formatarDataPaciente(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 8);
    if (value.length > 4) {
      value = value.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{2})/, "$1/$2");
    }
    input.value = value;
    this.fichaMedicaForm.get('dataNascimento')?.setValue(value, { emitEvent: false });
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

  // ── Upload Foto ──────────────────────────────────────────────────────────
  onFotoSelecionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const arquivo = input.files[0];
    const previewUrl = URL.createObjectURL(arquivo);
    this.perfil.update(p => p ? { ...p, foto: previewUrl } : p);

    const form = new FormData();
    form.append('foto', arquivo);
    this.enviandoFoto.set(true);

    this.http.post<any>(`${this.api}/api/v1/perfil/foto`, form).subscribe({
      next: (res) => {
        URL.revokeObjectURL(previewUrl);
        this.enviandoFoto.set(false);
        this.perfil.update(p => p ? { ...p, foto: res.foto } : p);
        this.showToast('sucesso', 'Foto de perfil atualizada!');
        input.value = '';
      },
      error: (e) => {
        URL.revokeObjectURL(previewUrl);
        this.enviandoFoto.set(false);
        this.carregarPerfil(true, true);
        this.showToast('erro', e.error?.message || 'Erro ao enviar foto.');
        input.value = '';
      }
    });
  }

  private msgErroUpload(e: any, contexto: string): string {
    const status = e?.status;
    const msg = e?.error?.message;
    if (status === 404) {
      return 'Recurso de upload indisponível no servidor. É necessário atualizar o backend (deploy).';
    }
    if (status === 403) return msg || 'Sem permissão para esta operação.';
    if (status === 413) return 'Arquivo muito grande. Máximo 10 MB.';
    if (status === 400) return msg || 'Arquivo inválido.';
    if (status === 0) return 'Sem conexão com o servidor. Verifique se o backend está rodando.';
    return msg || `Erro ao enviar ${contexto}.`;
  }

  private validarArquivoImagem(arquivo: File): string | null {
    const tipos = ['image/jpeg', 'image/png', 'image/webp'];
    const extensoes = ['.jpg', '.jpeg', '.png', '.webp'];
    const nome = arquivo.name.toLowerCase();
    const tipoOk = tipos.includes(arquivo.type) || extensoes.some(ext => nome.endsWith(ext));
    if (!tipoOk) return 'Use JPG, PNG ou WEBP.';
    if (arquivo.size > 10 * 1024 * 1024) return 'Arquivo muito grande. Máximo 10 MB.';
    return null;
  }

  onFotoClinicaSelecionada(event: Event) {
    const c = this.clinica();
    if (!c?.id) {
      this.showToast('erro', 'Salve a clínica antes de enviar a foto.');
      return;
    }
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const arquivo = input.files[0];
    const erroValidacao = this.validarArquivoImagem(arquivo);
    if (erroValidacao) {
      this.showToast('erro', erroValidacao);
      input.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(arquivo);
    this.clinica.update(cl => cl ? { ...cl, foto: previewUrl } : cl);

    const form = new FormData();
    form.append('foto', arquivo);
    this.enviandoFotoClinica.set(true);

    this.http.post<any>(`${this.api}/api/v1/organizations/${c.id}/foto`, form).subscribe({
      next: (res) => {
        URL.revokeObjectURL(previewUrl);
        this.enviandoFotoClinica.set(false);
        const foto = res.foto || res.organization?.foto;
        this.clinica.update(cl => cl ? { ...cl, foto } : cl);
        this.perfil.update(p => p?.clinicaAdmin
          ? { ...p, clinicaAdmin: { ...p.clinicaAdmin, foto } }
          : p);
        this.showToast('sucesso', 'Foto da clínica atualizada!');
        input.value = '';
      },
      error: (e) => {
        URL.revokeObjectURL(previewUrl);
        this.enviandoFotoClinica.set(false);
        this.carregarPerfil(true, true);
        this.showToast('erro', this.msgErroUpload(e, 'foto da clínica'));
        input.value = '';
      }
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

  formatarCnpjInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 14);
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    if (v.length > 5) v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    if (v.length > 8) v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    if (v.length > 12) v = v.replace(/(\d{4})(\d)/, '$1-$2');
    
    this.step1ClinicaForm.get('cnpj')?.setValue(v, { emitEvent: false });
  }

  formatarTelefoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    if (v.length > 9) v = v.replace(/(\d)(\d{4})$/, '$1-$2');
    else if (v.length > 5) v = v.replace(/(\d)(\d{4})$/, '$1-$2');
    
    this.step1ClinicaForm.get('telefone')?.setValue(v, { emitEvent: false });
  }

  formatarEmailInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const v = input.value.toLowerCase().trim();
    this.step1ClinicaForm.get('emailContato')?.setValue(v, { emitEvent: false });
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
      ? this.http.patch<ClinicaDetalhes>(`${this.api}/api/v1/organizations/${c.id}`, payload)
      : this.http.post<ClinicaDetalhes>(`${this.api}/api/v1/organizations`, payload);

    req.subscribe({
      next: (cl) => {
        this.salvando.set(false);
        this.clinica.set(cl);
        this.perfil.update(p => p ? { ...p, clinicaAdmin: cl } : p);
        this.editandoClinica.set(false);
        const eraNova = !c;
        if (eraNova) {
          this.authService.refreshUserProfile().subscribe();
          this.authService.loadOrganizations().subscribe();
        }
        this.showToast(
          'sucesso',
          eraNova
            ? 'Clínica criada! Você agora é Gestor Clínico desta unidade.'
            : 'Clínica atualizada! Todos os endereços dos profissionais vinculados foram atualizados.'
        );
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
    this.http.post<any>(`${this.api}/api/v1/organizations/${c.id}/invites`, { email, role: 'ESPECIALISTA' }).subscribe({
      next: (res) => {
        this.adicionandoMembro.set(false);
        this.emailNovoMembro.set('');
        this.showToast('sucesso', 'Convite de especialista enviado com sucesso!');
      },
      error: (e) => { this.adicionandoMembro.set(false); this.erroMembro.set(e.error?.message || 'Erro ao convidar.'); }
    });
  }

  removerMembro(espId: number) {
    const c = this.clinica();
    if (!c || !confirm('Remover este profissional da clínica?')) return;
    this.http.delete(`${this.api}/api/v1/organizations/${c.id}/members/${espId}`).subscribe({
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
