import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Check, Building2, User, Mail, Phone, Lock, Loader2, Dumbbell, Apple, Stethoscope, HeartPulse, Users, AlertCircle, CheckCircle, CreditCard, Shield, QrCode, Copy, Clock } from 'lucide-react';
import api from '../services/api';
import { Logo } from './ui/Logo';

type PaymentMethod = 'card' | 'pix';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface SignupPageProps {
  onBack: () => void;
  onSuccess: () => void;
  initialPlanId?: string;
}

type Step = 1 | 2 | 3;

export function SignupPage({ onBack, onSuccess, initialPlanId }: SignupPageProps) {
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
    isAnnual?: boolean;
  } | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  // Estado para método de pagamento
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  
  // Estado para PIX
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeBase64: string;
    expirationDate: string;
    paymentId: number;
  } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [checkingPixStatus, setCheckingPixStatus] = useState(false);
  const pixPollingRef = useRef<NodeJS.Timeout | null>(null);

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
      const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
      if (!publicKey) {
        console.error('VITE_MP_PUBLIC_KEY não configurada');
        return;
      }
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
    return selectedModulesCount === selectedPlan.modules;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    // CPF é obrigatório para ambos os métodos
    if (!formData.docNumber.replace(/\D/g, '').match(/^\d{11}$|^\d{14}$/)) {
      newErrors.docNumber = 'CPF/CNPJ inválido';
    }
    
    // Validações específicas para cartão
    if (paymentMethod === 'card') {
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

  // Handler para pagamento PIX
  const handlePixSubmit = async () => {
    if (!validateStep3()) return;
    
    setLoading(true);
    setApiError(null);
    
    try {
      const docNumber = formData.docNumber.replace(/\D/g, '');
      const slug = generateSlug(formData.consultancyName) + '-' + Date.now().toString(36);

      interface PixResponse {
        success: boolean;
        pixData: {
          qrCode: string;
          qrCodeBase64: string;
          expirationDate: string;
          paymentId: number;
        };
        pendingConsultancy: {
          consultancyName: string;
          adminEmail: string;
        };
      }

      // PIX é plano anual (10 meses pelo preço de 12 = 2 meses grátis)
      const annualPrice = totalPrice * 10;
      
      const response = await api.post<PixResponse>('/signup/consultancy/pix', {
        consultancyName: formData.consultancyName,
        consultancySlug: slug,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        adminPassword: formData.adminPassword,
        modules: formData.modules,
        maxProfessionals: formData.maxProfessionals,
        maxPatients: formData.maxPatients,
        priceMonthly: totalPrice, // Valor mensal para referência
        priceAnnual: annualPrice, // Valor que será cobrado
        isAnnual: true,
        payerDocType: docNumber.length === 11 ? 'CPF' : 'CNPJ',
        payerDocNumber: docNumber,
      });

      if (response.data.success && response.data.pixData) {
        setPixData(response.data.pixData);
        // Iniciar polling para verificar status do pagamento
        startPixPolling(response.data.pixData.paymentId);
      }
    } catch (error: unknown) {
      console.error('Erro ao gerar PIX:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        setApiError(axiosError.response?.data?.error || 'Erro ao gerar PIX. Tente novamente.');
      } else {
        setApiError('Erro de conexão. Verifique sua internet e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Polling para verificar status do pagamento PIX
  const startPixPolling = (paymentId: number) => {
    setCheckingPixStatus(true);
    
    // Limpar polling anterior se existir
    if (pixPollingRef.current) {
      clearInterval(pixPollingRef.current);
    }
    
    // Verificar a cada 5 segundos
    pixPollingRef.current = setInterval(async () => {
      try {
        interface PixStatusResponse {
          status: string;
          consultancyData?: {
            consultancyName: string;
            adminEmail: string;
            paymentId: string;
          };
        }
        
        const response = await api.get<PixStatusResponse>(`/signup/pix/status/${paymentId}`);
        
        if (response.data.status === 'approved') {
          // Pagamento aprovado! Parar polling e mostrar sucesso
          if (pixPollingRef.current) {
            clearInterval(pixPollingRef.current);
          }
          setCheckingPixStatus(false);
          setPixData(null);
          setSignupSuccess({
            consultancyName: response.data.consultancyData?.consultancyName || formData.consultancyName,
            adminEmail: response.data.consultancyData?.adminEmail || formData.adminEmail,
            paymentId: response.data.consultancyData?.paymentId || String(paymentId),
            isAnnual: true, // PIX é sempre anual
          });
        } else if (response.data.status === 'cancelled' || response.data.status === 'rejected') {
          // Pagamento cancelado ou rejeitado
          if (pixPollingRef.current) {
            clearInterval(pixPollingRef.current);
          }
          setCheckingPixStatus(false);
          setPixData(null);
          setApiError('Pagamento PIX expirado ou cancelado. Tente novamente.');
        }
        // Se ainda estiver pendente, continua o polling
      } catch (error) {
        console.error('Erro ao verificar status do PIX:', error);
      }
    }, 5000);
  };

  // Limpar polling quando componente desmontar
  useEffect(() => {
    return () => {
      if (pixPollingRef.current) {
        clearInterval(pixPollingRef.current);
      }
    };
  }, []);

  // Copiar código PIX
  const copyPixCode = async () => {
    if (pixData?.qrCode) {
      try {
        await navigator.clipboard.writeText(pixData.qrCode);
        setPixCopied(true);
        setTimeout(() => setPixCopied(false), 3000);
      } catch (error) {
        console.error('Erro ao copiar:', error);
      }
    }
  };

  // Configuração de módulos
  const availableModules = [
    { id: 'training' as const, name: 'Treinamento', description: 'Personal trainers e preparadores físicos', icon: Dumbbell, color: 'bg-orange-100 text-orange-600' },
    { id: 'nutrition' as const, name: 'Nutrição', description: 'Nutricionistas e dietistas', icon: Apple, color: 'bg-green-100 text-green-600' },
    { id: 'medical' as const, name: 'Médico', description: 'Médicos e especialistas', icon: Stethoscope, color: 'bg-blue-100 text-blue-600' },
    { id: 'rehab' as const, name: 'Reabilitação', description: 'Fisioterapeutas e reabilitadores', icon: HeartPulse, color: 'bg-pink-100 text-pink-600' },
  ];

  // Planos fixos
  const plans = [
    { id: 'starter', name: 'Starter', modules: 1, professionals: 3, patients: 50, price: 159.90, popular: false },
    { id: 'growth', name: 'Growth', modules: 2, professionals: 5, patients: 80, price: 297.90, popular: true },
    { id: 'scale', name: 'Scale', modules: 3, professionals: 10, patients: 200, price: 497.90, popular: false },
    { id: 'enterprise', name: 'Enterprise', modules: 4, professionals: 20, patients: 250, price: 797.90, popular: false },
  ];

  // Selecionar plano inicial baseado no initialPlanId ou Growth como padrão
  const getInitialPlan = () => {
    if (initialPlanId) {
      const plan = plans.find(p => p.id === initialPlanId);
      if (plan) return plan;
    }
    return plans[1]; // Growth como padrão
  };

  const [selectedPlan, setSelectedPlan] = useState(getInitialPlan());

  const selectedModulesCount = Object.values(formData.modules).filter(Boolean).length;
  const totalPrice = selectedPlan.price;

  const toggleModule = (moduleId: keyof typeof formData.modules) => {
    const currentCount = Object.values(formData.modules).filter(Boolean).length;
    const isSelecting = !formData.modules[moduleId];
    
    // Limitar seleção de módulos ao plano escolhido
    if (isSelecting && currentCount >= selectedPlan.modules) {
      return; // Não permite selecionar mais módulos do que o plano permite
    }
    
    setFormData({
      ...formData,
      modules: { ...formData.modules, [moduleId]: !formData.modules[moduleId] },
    });
  };

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    // Resetar módulos quando mudar de plano
    setFormData({
      ...formData,
      modules: { training: false, nutrition: false, medical: false, rehab: false },
      maxProfessionals: plan.professionals,
      maxPatients: plan.patients,
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
          <p className={`font-semibold mb-2 ${signupSuccess.isAnnual ? 'text-teal-600' : 'text-lime-600'}`}>
            Pagamento aprovado ✓
          </p>
          <p className="text-sm text-zinc-500 mb-8">
            {signupSuccess.isAnnual 
              ? '📅 Plano Anual - Acesso por 12 meses' 
              : '🔄 Assinatura Mensal - Renovação automática'}
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

            {/* Step 2 - Escolher Plano e Módulos */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-3">Escolha seu plano</h1>
                  <p className="text-zinc-600 text-lg">Selecione o plano ideal para sua consultoria</p>
                </div>

                {/* Planos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {plans.map((plan) => {
                    const isSelected = selectedPlan.id === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => handlePlanSelect(plan)}
                        className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                          isSelected ? 'border-lime-500 bg-lime-50' : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-lime-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                            POPULAR
                          </div>
                        )}
                        <div className="font-bold text-lg mb-1">{plan.name}</div>
                        <div className="text-2xl font-bold text-lime-600">
                          R$ {plan.price.toFixed(2).replace('.', ',')}
                        </div>
                        <div className="text-xs text-zinc-500 mb-3">/mês</div>
                        <div className="space-y-1 text-xs text-zinc-600">
                          <div className="flex items-center justify-center gap-1">
                            <Check className="w-3 h-3 text-lime-500" />
                            {plan.modules} módulo{plan.modules > 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <Check className="w-3 h-3 text-lime-500" />
                            {plan.professionals} profissionais
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <Check className="w-3 h-3 text-lime-500" />
                            {plan.patients} pacientes
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Módulos */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-3">
                    Escolha {selectedPlan.modules} módulo{selectedPlan.modules > 1 ? 's' : ''} para seu plano:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableModules.map((module) => {
                      const Icon = module.icon;
                      const isSelected = formData.modules[module.id];
                      const canSelect = isSelected || selectedModulesCount < selectedPlan.modules;
                      return (
                        <button
                          key={module.id}
                          type="button"
                          onClick={() => toggleModule(module.id)}
                          disabled={!canSelect && !isSelected}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-lime-500 bg-lime-50'
                              : canSelect
                              ? 'border-zinc-200 hover:border-zinc-300'
                              : 'border-zinc-100 bg-zinc-50 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${module.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold">{module.name}</span>
                              <div className="text-sm text-zinc-500">{module.description}</div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-lime-500 border-lime-500' : 'border-zinc-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">
                    {selectedModulesCount}/{selectedPlan.modules} módulos selecionados
                    {selectedModulesCount < selectedPlan.modules && (
                      <span className="text-amber-600"> - Selecione mais {selectedPlan.modules - selectedModulesCount}</span>
                    )}
                  </p>
                </div>

                {/* Resumo do Plano */}
                <div className="bg-zinc-900 text-white p-5 rounded-xl">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-700">
                    <div>
                      <div className="text-sm text-zinc-400">Plano selecionado</div>
                      <div className="text-xl font-bold">{selectedPlan.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-400">Total mensal</div>
                      <div className="text-2xl font-bold">
                        R$ {totalPrice.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="text-zinc-400">Módulos</div>
                      <div className="font-bold">{selectedPlan.modules}</div>
                    </div>
                    <div>
                      <div className="text-zinc-400">Profissionais</div>
                      <div className="font-bold">{selectedPlan.professionals}</div>
                    </div>
                    <div>
                      <div className="text-zinc-400">Pacientes</div>
                      <div className="font-bold">{selectedPlan.patients}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-zinc-300 text-zinc-700 font-semibold rounded-xl hover:border-black hover:text-black transition-colors">
                    Voltar
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={selectedModulesCount !== selectedPlan.modules}
                    className="flex-1 py-4 bg-black text-white font-semibold rounded-xl hover:bg-lime-500 hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
                  <p className="text-zinc-600 text-lg">Escolha como deseja pagar</p>
                </div>

                {/* Resumo */}
                <div className={`p-4 rounded-xl flex items-center justify-between border-2 ${
                  paymentMethod === 'pix' ? 'bg-teal-50 border-teal-200' : 'bg-lime-50 border-lime-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      paymentMethod === 'pix' ? 'bg-teal-500' : 'bg-lime-500'
                    }`}>
                      {paymentMethod === 'pix' ? (
                        <QrCode className="w-5 h-5 text-white" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-black" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold">{formData.consultancyName}</div>
                      <div className="text-sm text-zinc-600">
                        Plano {selectedPlan.name} - {paymentMethod === 'pix' ? 'Anual' : 'Mensal recorrente'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      R$ {paymentMethod === 'pix' 
                        ? (totalPrice * 10).toFixed(2).replace('.', ',') 
                        : totalPrice.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-sm text-zinc-500">
                      {paymentMethod === 'pix' ? '/ano' : '/mês'}
                    </div>
                  </div>
                </div>

                {/* Se tiver PIX gerado, mostrar QR Code */}
                {pixData ? (
                  <div className="space-y-6">
                    {/* QR Code PIX */}
                    <div className="bg-white border-2 border-zinc-200 rounded-xl p-6">
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium mb-3">
                          <QrCode className="w-4 h-4" />
                          PIX
                        </div>
                        <h3 className="font-bold text-lg">Escaneie o QR Code para pagar</h3>
                        <p className="text-sm text-zinc-500">Abra o app do seu banco e escaneie</p>
                      </div>
                      
                      {/* QR Code Image */}
                      <div className="flex justify-center mb-4">
                        <div className="bg-white p-4 rounded-xl border-2 border-zinc-100">
                          <img 
                            src={`data:image/png;base64,${pixData.qrCodeBase64}`} 
                            alt="QR Code PIX" 
                            className="w-48 h-48"
                          />
                        </div>
                      </div>
                      
                      {/* Código Copia e Cola */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-600">Ou copie o código PIX:</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={pixData.qrCode}
                            className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-mono truncate"
                          />
                          <button
                            onClick={copyPixCode}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                              pixCopied 
                                ? 'bg-green-500 text-white' 
                                : 'bg-zinc-900 text-white hover:bg-zinc-800'
                            }`}
                          >
                            {pixCopied ? (
                              <><CheckCircle className="w-4 h-4" /> Copiado!</>
                            ) : (
                              <><Copy className="w-4 h-4" /> Copiar</>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Status de verificação */}
                      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          {checkingPixStatus ? (
                            <>
                              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                              <div>
                                <p className="font-medium text-amber-800">Aguardando pagamento...</p>
                                <p className="text-sm text-amber-600">A tela atualizará automaticamente após a confirmação</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Clock className="w-5 h-5 text-amber-600" />
                              <div>
                                <p className="font-medium text-amber-800">PIX gerado!</p>
                                <p className="text-sm text-amber-600">Escaneie o QR Code ou copie o código acima</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Botão para cancelar e voltar */}
                    <button 
                      onClick={() => {
                        setPixData(null);
                        if (pixPollingRef.current) {
                          clearInterval(pixPollingRef.current);
                        }
                        setCheckingPixStatus(false);
                      }} 
                      className="w-full py-3 border-2 border-zinc-300 text-zinc-700 font-semibold rounded-xl hover:border-black hover:text-black transition-colors"
                    >
                      Escolher outro método de pagamento
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Seleção de método de pagamento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          paymentMethod === 'card' 
                            ? 'border-lime-500 bg-lime-50' 
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === 'card' ? 'bg-lime-500' : 'bg-zinc-100'
                          }`}>
                            <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-black' : 'text-zinc-500'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">Cartão de Crédito</div>
                            <div className="text-sm text-zinc-500">Assinatura mensal</div>
                            <div className="mt-2 text-lg font-bold text-lime-600">
                              R$ {totalPrice.toFixed(2).replace('.', ',')}<span className="text-sm font-normal text-zinc-500">/mês</span>
                            </div>
                            <div className="mt-1 text-xs text-zinc-400">
                              🔄 Renovação automática
                            </div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                          paymentMethod === 'pix' 
                            ? 'border-teal-500 bg-teal-50' 
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        {/* Badge de economia */}
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          2 MESES GRÁTIS
                        </div>
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === 'pix' ? 'bg-teal-500' : 'bg-zinc-100'
                          }`}>
                            <QrCode className={`w-5 h-5 ${paymentMethod === 'pix' ? 'text-white' : 'text-zinc-500'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">PIX</div>
                            <div className="text-sm text-zinc-500">Plano anual</div>
                            <div className="mt-2 text-lg font-bold text-teal-600">
                              R$ {(totalPrice * 10).toFixed(2).replace('.', ',')}<span className="text-sm font-normal text-zinc-500">/ano</span>
                            </div>
                            <div className="mt-1 text-xs text-zinc-400">
                              💰 Economia de R$ {(totalPrice * 2).toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                    
                    {/* Informação sobre assinatura recorrente */}
                    {paymentMethod === 'card' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            🔄
                          </div>
                          <div>
                            <p className="font-medium text-amber-800">Assinatura Recorrente</p>
                            <p className="text-sm text-amber-700 mt-1">
                              Seu cartão será cobrado automaticamente todo mês no valor de <strong>R$ {totalPrice.toFixed(2).replace('.', ',')}</strong>. 
                              Você pode cancelar a qualquer momento pelo painel.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Formulário de Cartão */}
                    {paymentMethod === 'card' && (
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
                      </div>
                    )}

                    {/* Formulário de PIX (apenas CPF) */}
                    {paymentMethod === 'pix' && (
                      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <QrCode className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-teal-800">Plano Anual via PIX</p>
                            <p className="text-sm text-teal-600">
                              Pague <strong>R$ {(totalPrice * 10).toFixed(2).replace('.', ',')}</strong> e tenha acesso por <strong>12 meses</strong>. 
                              Você economiza o equivalente a 2 meses!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CPF - comum para ambos */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">
                        CPF {paymentMethod === 'card' ? 'do Titular' : 'do Pagador'} *
                      </label>
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
                      
                      {paymentMethod === 'card' ? (
                        <button onClick={handleSubmit} disabled={loading || !mpLoaded}
                          className="flex-1 py-4 bg-lime-500 text-black font-semibold rounded-xl hover:bg-lime-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</> : <>Assinar R$ {totalPrice.toFixed(2).replace('.', ',')}/mês <Check className="w-5 h-5" /></>}
                        </button>
                      ) : (
                        <button onClick={handlePixSubmit} disabled={loading}
                          className="flex-1 py-4 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Gerando PIX...</> : <>Pagar R$ {(totalPrice * 10).toFixed(2).replace('.', ',')} (anual) <QrCode className="w-5 h-5" /></>}
                        </button>
                      )}
                    </div>

                    <p className="text-center text-xs text-zinc-500">
                      Ao confirmar, você concorda com os{' '}
                      <a href="#" className="text-lime-600 hover:underline">Termos de Uso</a> e{' '}
                      <a href="#" className="text-lime-600 hover:underline">Política de Privacidade</a>
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex w-[45%] bg-zinc-100 text-black p-12 flex-col justify-between">
        <div>
          <div className="mb-16">
            <Logo size="lg" showText={false} />
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-8">
            Transforme sua<br />consultoria em uma<br /><span className="text-lime-600">máquina digital.</span>
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold mb-1">Setup em minutos</div>
                <div className="text-zinc-600 text-sm">Configure e comece a usar imediatamente.</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold mb-1">Pagamento seguro</div>
                <div className="text-zinc-600 text-sm">Processado pelo Mercado Pago.</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold mb-1">Suporte dedicado</div>
                <div className="text-zinc-600 text-sm">Time pronto para ajudar.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-300">
          <p className="text-zinc-500 text-sm">Mais de 500 consultorias já confiam na VITAE</p>
        </div>
      </div>
    </div>
  );
}
