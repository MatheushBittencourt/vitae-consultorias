import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Building2, User, Mail, Phone, Lock, Sparkles, Loader2, Dumbbell, Apple, Stethoscope, HeartPulse, Users, AlertCircle, CheckCircle, CreditCard, Shield } from 'lucide-react';
import api from '../services/api';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface SignupPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

type Step = 1 | 2 | 3;

export function SignupPage({ onBack, onSuccess }: SignupPageProps) {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [mpLoaded, setMpLoaded] = useState(false);
  const [mpInstance, setMpInstance] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Step 1 - Consultoria e Admin
    consultancyName: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    adminPasswordConfirm: '',
    // Step 2 - Módulos e Capacidade
    modules: {
      training: false,
      nutrition: false,
      medical: false,
      rehab: false,
    },
    maxProfessionals: 3,
    maxPatients: 30,
    // Step 3 - Pagamento
    cardNumber: '',
    cardholderName: '',
    cardExpiry: '',
    cardCvv: '',
    docType: 'CPF',
    docNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<{
    consultancyName: string;
    adminEmail: string;
    paymentId: string;
  } | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Carregar SDK do Mercado Pago
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => setMpLoaded(true);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Inicializar Mercado Pago
  useEffect(() => {
    if (mpLoaded && window.MercadoPago) {
      const publicKey = 'TEST-8f2e0407-fba9-4767-8bd1-6a61411d9d1c';
      const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
      setMpInstance(mp);
    }
  }, [mpLoaded]);

  // Gerar slug a partir do nome (uso interno)
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  };

  // Verificar disponibilidade do email
  const checkEmailAvailability = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailAvailable(null);
      return;
    }
    setCheckingEmail(true);
    try {
      const response = await api.get<{ available: boolean }>(`/signup/check-email/${email.toLowerCase()}`);
      setEmailAvailable(response.data.available);
    } catch {
      setEmailAvailable(null);
    } finally {
      setCheckingEmail(false);
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.consultancyName.trim()) {
      newErrors.consultancyName = 'Nome da consultoria é obrigatório';
    }
    if (!formData.adminName.trim()) {
      newErrors.adminName = 'Nome é obrigatório';
    }
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Email inválido';
    } else if (emailAvailable === false) {
      newErrors.adminEmail = 'Este email já está cadastrado';
    }
    if (!formData.adminPassword) {
      newErrors.adminPassword = 'Senha é obrigatória';
    } else if (formData.adminPassword.length < 6) {
      newErrors.adminPassword = 'Senha deve ter pelo menos 6 caracteres';
    }
    if (formData.adminPassword !== formData.adminPasswordConfirm) {
      newErrors.adminPasswordConfirm = 'Senhas não conferem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    return selectedModulesCount > 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{13,19}$/)) {
      newErrors.cardNumber = 'Número do cartão inválido';
    }
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Nome no cartão é obrigatório';
    }
    if (!formData.cardExpiry.match(/^\d{2}\/\d{2}$/)) {
      newErrors.cardExpiry = 'Validade inválida (MM/AA)';
    }
    if (!formData.cardCvv.match(/^\d{3,4}$/)) {
      newErrors.cardCvv = 'CVV inválido';
    }
    if (!formData.docNumber.replace(/\D/g, '').match(/^\d{11}$|^\d{14}$/)) {
      newErrors.docNumber = 'CPF/CNPJ inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ') : numbers;
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4);
    }
    return numbers;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    
    setLoading(true);
    setApiError(null);
    
    try {
      if (!mpInstance) {
        throw new Error('SDK do Mercado Pago não carregado. Aguarde ou recarregue a página.');
      }

      const [expiryMonth, expiryYear] = formData.cardExpiry.split('/');
      const cardNumber = formData.cardNumber.replace(/\s/g, '');
      const docNumber = formData.docNumber.replace(/\D/g, '');
      
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        throw new Error('Número do cartão inválido');
      }

      let cardTokenResponse;
      try {
        cardTokenResponse = await mpInstance.createCardToken({
          cardNumber: cardNumber,
          cardholderName: formData.cardholderName.toUpperCase(),
          cardExpirationMonth: expiryMonth,
          cardExpirationYear: '20' + expiryYear,
          securityCode: formData.cardCvv,
          identificationType: docNumber.length === 11 ? 'CPF' : 'CNPJ',
          identificationNumber: docNumber,
        });
      } catch (tokenError: any) {
        console.error('Erro ao criar token:', tokenError);
        if (tokenError?.cause) {
          const causes = tokenError.cause;
          if (Array.isArray(causes) && causes.length > 0) {
            const errorMessages: Record<string, string> = {
              '205': 'Número do cartão inválido',
              '208': 'Mês de validade inválido',
              '209': 'Ano de validade inválido',
              '212': 'Tipo de documento inválido',
              '213': 'Número do documento inválido',
              '214': 'Número do documento inválido',
              '220': 'Banco emissor não encontrado',
              '221': 'Titular do cartão inválido',
              '224': 'CVV inválido',
              'E301': 'Número do cartão inválido',
              'E302': 'CVV inválido',
              '316': 'Titular do cartão inválido',
            };
            const firstError = causes[0];
            const message = errorMessages[firstError.code] || firstError.description || 'Erro nos dados do cartão';
            throw new Error(message);
          }
        }
        throw new Error('Erro ao processar os dados do cartão. Verifique as informações.');
      }

      if (!cardTokenResponse?.id) {
        console.error('Token response:', cardTokenResponse);
        throw new Error('Não foi possível processar o cartão. Verifique os dados.');
      }

      // Gerar slug automaticamente
      const slug = generateSlug(formData.consultancyName) + '-' + Date.now().toString(36);

      interface SignupResponse {
        success: boolean;
        data: {
          consultancyName: string;
          adminEmail: string;
          payment?: { id: string };
        };
      }
      
      const response = await api.post<SignupResponse>('/signup/consultancy', {
        consultancyName: formData.consultancyName,
        consultancySlug: slug,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        adminPassword: formData.adminPassword,
        modules: formData.modules,
        maxProfessionals: formData.maxProfessionals,
        maxPatients: formData.maxPatients,
        priceMonthly: totalPrice,
        cardToken: cardTokenResponse.id,
        payerDocType: docNumber.length === 11 ? 'CPF' : 'CNPJ',
        payerDocNumber: docNumber,
      });

      if (response.data.success) {
        setSignupSuccess({
          consultancyName: response.data.data.consultancyName,
          adminEmail: response.data.data.adminEmail,
          paymentId: response.data.data.payment?.id || '',
        });
      }
    } catch (error: unknown) {
      console.error('Erro ao criar consultoria:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string; paymentStatusDetail?: string } } };
        const errorMsg = axiosError.response?.data?.error || 'Erro ao criar consultoria. Tente novamente.';
        const statusDetail = axiosError.response?.data?.paymentStatusDetail;
        
        const statusMessages: Record<string, string> = {
          'cc_rejected_bad_filled_card_number': 'Número do cartão incorreto',
          'cc_rejected_bad_filled_date': 'Data de validade incorreta',
          'cc_rejected_bad_filled_other': 'Dados do cartão incorretos',
          'cc_rejected_bad_filled_security_code': 'CVV incorreto',
          'cc_rejected_blacklist': 'Cartão não permitido',
          'cc_rejected_call_for_authorize': 'Ligue para autorizar a compra',
          'cc_rejected_card_disabled': 'Cartão desabilitado',
          'cc_rejected_card_error': 'Erro no cartão',
          'cc_rejected_duplicated_payment': 'Pagamento duplicado',
          'cc_rejected_high_risk': 'Pagamento recusado por segurança',
          'cc_rejected_insufficient_amount': 'Saldo insuficiente',
          'cc_rejected_invalid_installments': 'Parcelas inválidas',
          'cc_rejected_max_attempts': 'Limite de tentativas excedido',
          'cc_rejected_other_reason': 'Pagamento recusado. Tente outro cartão.',
        };
        
        setApiError(statusMessages[statusDetail || ''] || errorMsg);
      } else if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError('Erro de conexão. Verifique sua internet e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Configuração de módulos
  const availableModules = [
    { id: 'training' as const, name: 'Treinamento', description: 'Personal trainers e preparadores físicos', icon: Dumbbell, price: 97, color: 'bg-orange-100 text-orange-600' },
    { id: 'nutrition' as const, name: 'Nutrição', description: 'Nutricionistas e dietistas', icon: Apple, price: 97, color: 'bg-green-100 text-green-600' },
    { id: 'medical' as const, name: 'Médico', description: 'Médicos e especialistas', icon: Stethoscope, price: 127, color: 'bg-blue-100 text-blue-600' },
    { id: 'rehab' as const, name: 'Reabilitação', description: 'Fisioterapeutas e reabilitadores', icon: HeartPulse, price: 97, color: 'bg-pink-100 text-pink-600' },
  ];

  const capacityOptions = [
    { professionals: 3, patients: 30, basePrice: 0, label: 'Starter' },
    { professionals: 5, patients: 50, basePrice: 50, label: 'Growth' },
    { professionals: 10, patients: 100, basePrice: 150, label: 'Scale' },
    { professionals: 20, patients: 250, basePrice: 350, label: 'Enterprise' },
  ];

  const calculatePrice = () => {
    const selectedModules = Object.entries(formData.modules)
      .filter(([, selected]) => selected)
      .map(([id]) => availableModules.find(m => m.id === id)!);
    const modulesPrice = selectedModules.reduce((sum, m) => sum + m.price, 0);
    const capacityOption = capacityOptions.find(c => c.professionals === formData.maxProfessionals);
    const capacityPrice = capacityOption?.basePrice || 0;
    return modulesPrice + capacityPrice;
  };

  const selectedModulesCount = Object.values(formData.modules).filter(Boolean).length;
  const totalPrice = calculatePrice();

  const toggleModule = (moduleId: keyof typeof formData.modules) => {
    setFormData({
      ...formData,
      modules: { ...formData.modules, [moduleId]: !formData.modules[moduleId] },
    });
  };

  // Tela de sucesso
  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-lime-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-black" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3">Consultoria criada com sucesso! 🎉</h1>
          <p className="text-zinc-600 text-lg mb-2">
            Bem-vindo à VITAE, <strong>{signupSuccess.consultancyName}</strong>!
          </p>
          <p className="text-lime-600 font-semibold mb-8">
            Pagamento aprovado ✓
          </p>

          <div className="bg-white border-2 border-zinc-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold mb-4">Próximos passos:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-lime-100 text-lime-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-medium">Faça login no painel</p>
                  <p className="text-sm text-zinc-500">Use o email: <strong>{signupSuccess.adminEmail}</strong></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-lime-100 text-lime-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-medium">Configure sua equipe</p>
                  <p className="text-sm text-zinc-500">Adicione profissionais e pacientes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-lime-100 text-lime-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-medium">Comece a usar!</p>
                  <p className="text-sm text-zinc-500">Sua consultoria está pronta</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onSuccess}
            className="w-full py-4 bg-black text-white font-semibold rounded-xl hover:bg-lime-500 hover:text-black transition-colors"
          >
            Ir para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 sm:p-8">
          <button onClick={onBack} className="flex items-center gap-2 text-zinc-600 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar ao site</span>
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 pb-12">
          <div className="w-full max-w-lg">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-3 mb-12">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    step >= s ? 'bg-lime-500 text-black' : 'bg-zinc-200 text-zinc-500'
                  }`}>
                    {step > s ? <Check className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && <div className={`w-12 sm:w-16 h-1 rounded ${step > s ? 'bg-lime-500' : 'bg-zinc-200'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1 - Dados da Consultoria e Admin */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-3">Crie sua consultoria</h1>
                  <p className="text-zinc-600 text-lg">Preencha os dados para começar</p>
                </div>

                <div className="space-y-4">
                  {/* Nome da Consultoria */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Nome da Consultoria *</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        value={formData.consultancyName}
                        onChange={(e) => setFormData({ ...formData, consultancyName: e.target.value })}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-colors ${
                          errors.consultancyName ? 'border-red-300 bg-red-50' : 'border-zinc-200 focus:border-lime-500'
                        }`}
                        placeholder="Ex: Performance Elite"
                      />
                    </div>
                    {errors.consultancyName && <p className="mt-1 text-sm text-red-500">{errors.consultancyName}</p>}
                  </div>

                  {/* Seu nome */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Seu nome completo *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        value={formData.adminName}
                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-colors ${
                          errors.adminName ? 'border-red-300 bg-red-50' : 'border-zinc-200 focus:border-lime-500'
                        }`}
                        placeholder="João Silva"
                      />
                    </div>
                    {errors.adminName && <p className="mt-1 text-sm text-red-500">{errors.adminName}</p>}
                  </div>

                  {/* Email e Telefone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                          type="email"
                          value={formData.adminEmail}
                          onChange={(e) => { setFormData({ ...formData, adminEmail: e.target.value }); setEmailAvailable(null); }}
                          onBlur={() => checkEmailAvailability(formData.adminEmail)}
                          className={`w-full pl-12 pr-10 py-3 border-2 rounded-xl outline-none transition-colors ${
                            errors.adminEmail || emailAvailable === false ? 'border-red-300 bg-red-50' : emailAvailable === true ? 'border-lime-500 bg-lime-50' : 'border-zinc-200 focus:border-lime-500'
                          }`}
                          placeholder="email@exemplo.com"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {checkingEmail && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
                          {!checkingEmail && emailAvailable === true && <CheckCircle className="w-4 h-4 text-lime-500" />}
                          {!checkingEmail && emailAvailable === false && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      </div>
                      {errors.adminEmail && <p className="mt-1 text-sm text-red-500">{errors.adminEmail}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                          type="tel"
                          value={formData.adminPhone}
                          onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 border-2 border-zinc-200 rounded-xl outline-none focus:border-lime-500 transition-colors"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Senhas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">Senha *</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                          type="password"
                          value={formData.adminPassword}
                          onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                          className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-colors ${
                            errors.adminPassword ? 'border-red-300 bg-red-50' : 'border-zinc-200 focus:border-lime-500'
                          }`}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.adminPassword && <p className="mt-1 text-sm text-red-500">{errors.adminPassword}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">Confirmar *</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                          type="password"
                          value={formData.adminPasswordConfirm}
                          onChange={(e) => setFormData({ ...formData, adminPasswordConfirm: e.target.value })}
                          className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-colors ${
                            errors.adminPasswordConfirm ? 'border-red-300 bg-red-50' : 'border-zinc-200 focus:border-lime-500'
                          }`}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.adminPasswordConfirm && <p className="mt-1 text-sm text-red-500">{errors.adminPasswordConfirm}</p>}
                    </div>
                  </div>
                </div>

                <button onClick={handleNext} className="w-full py-4 bg-black text-white font-semibold rounded-xl hover:bg-lime-500 hover:text-black transition-colors flex items-center justify-center gap-2">
                  Continuar <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 2 - Módulos e Capacidade */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-3">Monte seu plano</h1>
                  <p className="text-zinc-600 text-lg">Escolha os módulos e a capacidade</p>
                </div>

                {/* Módulos */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-3">Quais profissionais vão usar?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableModules.map((module) => {
                      const Icon = module.icon;
                      const isSelected = formData.modules[module.id];
                      return (
                        <button key={module.id} type="button" onClick={() => toggleModule(module.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-lime-500 bg-lime-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${module.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">{module.name}</span>
                                <span className="text-sm font-bold text-lime-600">+R$ {module.price}</span>
                              </div>
                              <div className="text-sm text-zinc-500">{module.description}</div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-lime-500 border-lime-500' : 'border-zinc-300'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedModulesCount === 0 && <p className="mt-2 text-sm text-amber-600">Selecione pelo menos 1 módulo</p>}
                </div>

                {/* Capacidade */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-3">
                    <Users className="w-4 h-4 inline mr-2" />Tamanho da equipe
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {capacityOptions.map((option) => {
                      const isSelected = formData.maxProfessionals === option.professionals;
                      return (
                        <button key={option.professionals} type="button"
                          onClick={() => setFormData({ ...formData, maxProfessionals: option.professionals, maxPatients: option.patients })}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${isSelected ? 'border-lime-500 bg-lime-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                          <div className="font-bold text-lg">{option.professionals}</div>
                          <div className="text-xs text-zinc-500">profissionais</div>
                          <div className="text-xs text-zinc-400 mt-1">{option.patients} pacientes</div>
                          {option.basePrice > 0 && <div className="text-xs font-semibold text-lime-600 mt-1">+R$ {option.basePrice}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Resumo do Preço */}
                <div className="bg-zinc-900 text-white p-5 rounded-xl">
                  <div className="space-y-2 mb-4 pb-4 border-b border-zinc-700">
                    {Object.entries(formData.modules).filter(([, selected]) => selected).map(([id]) => {
                      const module = availableModules.find(m => m.id === id)!;
                      return (
                        <div key={id} className="flex justify-between text-sm">
                          <span>{module.name}</span><span>R$ {module.price}</span>
                        </div>
                      );
                    })}
                    {capacityOptions.find(c => c.professionals === formData.maxProfessionals)?.basePrice! > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Capacidade extra</span>
                        <span>R$ {capacityOptions.find(c => c.professionals === formData.maxProfessionals)?.basePrice}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-sm text-zinc-400">Total mensal</div>
                      <div className="text-2xl font-bold">
                        {selectedModulesCount > 0 ? <>R$ {totalPrice}<span className="text-base text-zinc-400">/mês</span></> : <span className="text-zinc-500">R$ --</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-zinc-300 text-zinc-700 font-semibold rounded-xl hover:border-black hover:text-black transition-colors">Voltar</button>
                  <button onClick={handleNext} disabled={selectedModulesCount === 0}
                    className="flex-1 py-4 bg-black text-white font-semibold rounded-xl hover:bg-lime-500 hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    Continuar <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 - Pagamento */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-3">Pagamento</h1>
                  <p className="text-zinc-600 text-lg">Dados do cartão de crédito</p>
                </div>

                {/* Resumo */}
                <div className="bg-lime-50 border-2 border-lime-200 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="font-bold">{formData.consultancyName}</div>
                      <div className="text-sm text-zinc-600">Assinatura mensal</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">R$ {totalPrice}</div>
                    <div className="text-sm text-zinc-500">/mês</div>
                  </div>
                </div>

                {/* Formulário */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Número do Cartão *</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                        maxLength={19}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-colors ${errors.cardNumber ? 'border-red-300 bg-red-50' : 'border-zinc-200 focus:border-lime-500'}`}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    {errors.cardNumber && <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Nome no Cartão *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        value={formData.cardholderName}
                        onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value.toUpperCase() })}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-colors ${errors.cardholderName ? 'border-red-300 bg-red-50' : 'border-zinc-200 focus:border-lime-500'}`}
                        placeholder="JOÃO SILVA"
                      />
                    </div>
                    {errors.cardholderName && <p className="mt-1 text-sm text-red-500">{errors.cardholderName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">Validade *</label>
                      <input
                        type="text"
                        value={formData.cardExpiry}
                        onChange={(e) => setFormData({ ...formData, cardExpiry: formatExpiry(e.target.value) })}
                        maxLength={5}
                        className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors ${errors.cardExpiry ? 'border-red-300 bg-red-50' : 'border-zinc-200 focus:border-lime-500'}`}
                        placeholder="MM/AA"
                      />
                      {errors.cardExpiry && <p className="mt-1 text-sm text-red-500">{errors.cardExpiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">CVV *</label>
                      <input
                        type="text"
                        value={formData.cardCvv}
                        onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value.replace(/\D/g, '') })}
                        maxLength={4}
                        className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors ${errors.cardCvv ? 'border-red-300 bg-red-50' : 'border-zinc-200 focus:border-lime-500'}`}
                        placeholder="123"
                      />
                      {errors.cardCvv && <p className="mt-1 text-sm text-red-500">{errors.cardCvv}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">CPF do Titular *</label>
                    <input
                      type="text"
                      value={formData.docNumber}
                      onChange={(e) => setFormData({ ...formData, docNumber: formatCPF(e.target.value) })}
                      maxLength={18}
                      className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors ${errors.docNumber ? 'border-red-300 bg-red-50' : 'border-zinc-200 focus:border-lime-500'}`}
                      placeholder="000.000.000-00"
                    />
                    {errors.docNumber && <p className="mt-1 text-sm text-red-500">{errors.docNumber}</p>}
                  </div>
                </div>

                {/* Segurança */}
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <Shield className="w-5 h-5 text-lime-500" />
                  <span>Seus dados estão protegidos com criptografia SSL</span>
                </div>

                {/* Erro */}
                {apiError && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Erro no pagamento</p>
                      <p className="text-sm">{apiError}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 border-2 border-zinc-300 text-zinc-700 font-semibold rounded-xl hover:border-black hover:text-black transition-colors">Voltar</button>
                  <button onClick={handleSubmit} disabled={loading || !mpLoaded}
                    className="flex-1 py-4 bg-lime-500 text-black font-semibold rounded-xl hover:bg-lime-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</> : <>Pagar R$ {totalPrice} <Check className="w-5 h-5" /></>}
                  </button>
                </div>

                <p className="text-center text-xs text-zinc-500">
                  Ao confirmar, você concorda com os{' '}
                  <a href="#" className="text-lime-600 hover:underline">Termos de Uso</a> e{' '}
                  <a href="#" className="text-lime-600 hover:underline">Política de Privacidade</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex w-[45%] bg-black text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">VITAE</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-8">
            Transforme sua<br />consultoria em uma<br /><span className="text-lime-500">máquina digital.</span>
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-lime-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-lime-500" />
              </div>
              <div>
                <div className="font-semibold mb-1">Setup em minutos</div>
                <div className="text-white/60 text-sm">Configure e comece a usar imediatamente.</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-lime-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-lime-500" />
              </div>
              <div>
                <div className="font-semibold mb-1">Pagamento seguro</div>
                <div className="text-white/60 text-sm">Processado pelo Mercado Pago.</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-lime-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-lime-500" />
              </div>
              <div>
                <div className="font-semibold mb-1">Suporte dedicado</div>
                <div className="text-white/60 text-sm">Time pronto para ajudar.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10">
          <p className="text-white/40 text-sm">Mais de 500 consultorias já confiam na VITAE</p>
        </div>
      </div>
    </div>
  );
}
