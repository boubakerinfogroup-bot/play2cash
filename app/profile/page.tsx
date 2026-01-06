'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, t } from '@/lib/utils'
import type { User } from '@/lib/auth'
import Modal from '@/components/Modal'
import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'
import BottomSheet from '@/components/BottomSheet'

export default function ProfilePage() {
  const router = useRouter()
  console.log('Profile Page v2.2 Loaded')
  const [user, setUser] = useState<User | null>(null)
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [transactions, setTransactions] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [depositModal, setDepositModal] = useState(false)
  const [withdrawalModal, setWithdrawalModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    const langStr = localStorage.getItem('language') || 'fr'

    if (!userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    setUser(userData)
    setLang(langStr as 'fr' | 'ar')
    setWhatsapp(userData.whatsapp)

    loadData()
  }, [router, filter])

  const loadData = async () => {
    try {
      // Load transactions
      const txResponse = await fetch('/api/user/transactions')
      const txData = await txResponse.json()
      if (txData.transactions) {
        setTransactions(txData.transactions)
      }

      // Load matches
      const matchesResponse = await fetch(`/api/user/matches?filter=${filter}`)
      const matchesData = await matchesResponse.json()
      if (matchesData.matches) {
        setMatches(matchesData.matches)
      }

      // Refresh balance
      const balanceResponse = await fetch('/api/user/balance')
      const balanceData = await balanceResponse.json()
      if (balanceData.balance !== undefined && user) {
        setUser({ ...user, balance: balanceData.balance })
        localStorage.setItem('user', JSON.stringify({ ...user, balance: balanceData.balance }))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = (error: string, lang: 'ar' | 'fr') => {
    const errorMap: Record<string, { ar: string, fr: string }> = {
      'Not authenticated': { ar: 'غير مصرح', fr: 'Non authentifié' },
      'Invalid amount': { ar: 'مبلغ غير صالح', fr: 'Montant invalide' },
      'WhatsApp number required': { ar: 'رقم الواتساب مطلوب', fr: 'Numéro WhatsApp requis' },
      'You already have a pending deposit request': { ar: 'لديك طلب إيداع قيد المعالجة بالفعل', fr: 'Vous avez déjà une demande de dépôt en cours' },
      'You already have a pending withdrawal request': { ar: 'لديك طلب سحب قيد المعالجة بالفعل', fr: 'Vous avez déjà une demande de retrait en cours' },
      'Insufficient balance': { ar: 'رصيد غير كاف', fr: 'Solde insuffisant' },
    }

    if (errorMap[error]) {
      return errorMap[error][lang]
    }

    return lang === 'ar' ? 'حدث خطأ غير متوقع' : 'Une erreur inattendue est survenue'
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/deposits/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: depositAmount, whatsapp })
      })

      const result = await response.json()
      if (result.success) {
        setDepositModal(false)
        setDepositAmount('')
        setFeedback({
          type: 'success',
          message: lang === 'ar' ? 'تم إرسال طلب الإيداع بنجاح. سيتم معالجته قريباً.' : 'Demande de dépôt envoyée avec succès. Elle sera traitée bientôt.'
        })
      } else {
        setFeedback({
          type: 'error',
          message: getErrorMessage(result.error || '', lang)
        })
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: lang === 'ar' ? 'فشل الاتصال بالخادم' : 'Échec de la connexion au serveur'
      })
    }
  }

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: withdrawalAmount, whatsapp })
      })

      const result = await response.json()
      if (result.success) {
        setWithdrawalModal(false)
        setWithdrawalAmount('')
        loadData() // Refresh balance
        setFeedback({
          type: 'success',
          message: lang === 'ar' ? 'تم إرسال طلب السحب بنجاح' : 'Demande de retrait envoyée avec succès'
        })
      } else {
        setFeedback({
          type: 'error',
          message: getErrorMessage(result.error || '', lang)
        })
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: lang === 'ar' ? 'فشل الاتصال بالخادم' : 'Échec de la connexion au serveur'
      })
    }
  }

  const toggleLang = () => {
    const newLang = lang === 'fr' ? 'ar' : 'fr'
    setLang(newLang)
    localStorage.setItem('language', newLang)
    window.location.reload()
  }

  const filterOptions = [
    { label: lang === 'ar' ? 'الكل' : 'Tout', value: 'all' },
    { label: lang === 'ar' ? 'اليوم' : 'Aujourd\'hui', value: 'today' },
    { label: lang === 'ar' ? 'هذا الأسبوع' : 'Cette semaine', value: 'week' },
    { label: lang === 'ar' ? 'هذا الشهر' : 'Ce mois', value: 'month' },
    { label: lang === 'ar' ? 'هذه السنة' : 'Cette année', value: 'year' },
  ]

  const getFilterLabel = (val: string) => {
    return filterOptions.find(o => o.value === val)?.label || val
  }

  if (loading || !user) {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className={lang === 'ar' ? 'arabic-text' : ''}>
      <Header user={user} lang={lang} />

      <div className="container" style={{ paddingBottom: '100px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '32px' }}>
          {t('profile', lang)} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>v2.2</span>
        </h1>

        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Account Info */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {lang === 'ar' ? 'معلومات الحساب' : 'Informations du compte'}
              </h2>
              <div style={{ padding: '4px 12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '20px', color: '#4f46e5', fontWeight: 'bold', fontSize: '0.9rem' }}>
                ID: {user.accountId || 'N/A'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  {lang === 'ar' ? 'الاسم' : 'Nom'}
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.name}</span>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  WhatsApp
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.whatsapp}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <button
              onClick={() => setDepositModal(true)}
              className="btn btn-success"
              style={{ padding: '16px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
            >
              <img src="/assets/deposit.png" alt="Deposit" width="48" height="48" style={{ objectFit: 'contain' }} />
              <span>{lang === 'ar' ? 'إيداع' : 'Dépôt'}</span>
            </button>
            <button
              onClick={() => setWithdrawalModal(true)}
              className="btn btn-danger"
              style={{ padding: '16px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)' }}
            >
              <img src="/assets/withdraw.png" alt="Withdraw" width="48" height="48" style={{ objectFit: 'contain' }} />
              <span>{lang === 'ar' ? 'سحب' : 'Retrait'}</span>
            </button>
          </div>

          {/* Match History */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {lang === 'ar' ? 'المباريات' : 'Matchs'}
              </h2>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="btn"
                style={{ padding: '6px 16px', fontSize: '0.85rem', height: 'auto', background: 'white', color: '#4f46e5', border: '1px solid #e2e8f0', boxShadow: 'none' }}
              >
                {getFilterLabel(filter)} ▼
              </button>
            </div>

            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr style={{ color: '#64748b', fontSize: '0.85rem', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                    <th style={{ padding: '0 8px' }}>{lang === 'ar' ? 'اللعبة' : 'Jeu'}</th>
                    <th style={{ padding: '0 8px' }}>{lang === 'ar' ? 'النتيجة' : 'Résultat'}</th>
                    <th style={{ padding: '0 8px', textAlign: 'right' }}>{lang === 'ar' ? 'المبلغ' : 'Gain/Perte'}</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                        {lang === 'ar' ? 'لا توجد مباريات' : 'Aucun match trouvé'}
                      </td>
                    </tr>
                  ) : (
                    matches.map((match) => (
                      <tr key={match.id} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '12px' }}>
                        <td style={{ padding: '12px', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                          <div style={{ fontWeight: 600 }}>{match.gameName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {new Date(match.completedAt).toLocaleDateString(lang === 'ar' ? 'ar-TN' : 'fr-FR')}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {match.tie ? (
                            <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {lang === 'ar' ? 'تعادل' : 'Nul'}
                            </span>
                          ) : match.won ? (
                            <span style={{ background: '#d1fae5', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {lang === 'ar' ? 'فوز' : 'Gagné'}
                            </span>
                          ) : (
                            <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {lang === 'ar' ? 'خسارة' : 'Perd'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', borderTopRightRadius: '12px', borderBottomRightRadius: '12px', color: match.won ? '#059669' : (match.tie ? '#d97706' : '#dc2626') }}>
                          {match.won ? '+' : ''}{formatCurrency(match.won ? (match.stake * 2 - match.platformFee * 2) - match.stake : (match.tie ? 0 : -match.stake), lang)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>
              {lang === 'ar' ? 'المعاملات' : 'Transactions'}
            </h2>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <tbody>
                  {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} style={{ background: 'rgba(255,255,255,0.6)' }}>
                      <td style={{ padding: '12px', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                        <span style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem' }}>
                          {tx.type === 'DEPOSIT' ? (lang === 'ar' ? 'إيداع' : 'Dépôt') :
                            tx.type === 'WITHDRAWAL' ? (lang === 'ar' ? 'سحب' : 'Retrait') : tx.type}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', borderTopRightRadius: '12px', borderBottomRightRadius: '12px', color: tx.amount > 0 ? '#059669' : '#dc2626' }}>
                        {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount, lang)}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={2} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>-</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      <BottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={lang === 'ar' ? 'تصفية التاريخ' : 'Filtrer l\'historique'}
        options={filterOptions}
        onSelect={(val) => setFilter(val)}
        selectedValue={filter}
      />

      {/* Deposit Modal */}
      <Modal
        isOpen={depositModal}
        onClose={() => setDepositModal(false)}
        title={lang === 'ar' ? 'طلب إيداع' : 'Demande de dépôt'}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/assets/deposit.png" alt="Deposit" width="64" height="64" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#64748b' }}>
            {lang === 'ar'
              ? 'أدخل المبلغ الذي تريد إيداعه ورقم الواتساب للتواصل.'
              : 'Entrez le montant à déposer et votre numéro WhatsApp.'}
          </p>
        </div>

        <form onSubmit={handleDeposit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              {lang === 'ar' ? 'رقم الواتساب' : 'Numéro WhatsApp'}
            </label>
            <input
              type="tel"
              className="form-control"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              placeholder="+216XXXXXXXX"
              style={{ fontSize: '1.1rem' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              {lang === 'ar' ? 'المبلغ (د.ت)' : 'Montant (TND)'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                className="form-control"
                min="1"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
                style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5', paddingLeft: lang === 'ar' ? '16px' : '48px', paddingRight: lang === 'ar' ? '48px' : '16px' }}
              />
              <span style={{ position: 'absolute', [lang === 'ar' ? 'right' : 'left']: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: '#94a3b8', fontWeight: 'bold' }}>
                {lang === 'ar' ? 'د.ت' : 'TND'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-success" style={{ flex: 1, padding: '16px' }}>
              {lang === 'ar' ? 'تأكيد الطلب' : 'Confirmer la demande'}
            </button>
            <button type="button" onClick={() => setDepositModal(false)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#334155', boxShadow: 'none' }}>
              {lang === 'ar' ? 'إلغاء' : 'Annuler'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Withdrawal Modal */}
      <Modal
        isOpen={withdrawalModal}
        onClose={() => setWithdrawalModal(false)}
        title={lang === 'ar' ? 'طلب سحب' : 'Demande de retrait'}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/assets/withdraw.png" alt="Withdraw" width="64" height="64" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#64748b' }}>
            {lang === 'ar'
              ? 'أدخل المبلغ الذي تريد سحبه. سيتم خصمه من رصيدك.'
              : 'Entrez le montant à retirer. Il sera déduit de votre solde.'}
          </p>
        </div>

        <form onSubmit={handleWithdrawal}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              {lang === 'ar' ? 'رقم الواتساب' : 'Numéro WhatsApp'}
            </label>
            <input
              type="tel"
              className="form-control"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              placeholder="+216XXXXXXXX"
              style={{ fontSize: '1.1rem' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              {lang === 'ar' ? 'المبلغ (د.ت)' : 'Montant (TND)'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                className="form-control"
                min="1"
                step="0.01"
                max={user?.balance || 0}
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                required
                style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', paddingLeft: lang === 'ar' ? '16px' : '48px', paddingRight: lang === 'ar' ? '48px' : '16px' }}
              />
              <span style={{ position: 'absolute', [lang === 'ar' ? 'right' : 'left']: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#94a3b8' }}>
                $
              </span>
            </div>
            {user && (
              <div style={{ marginTop: '8px', textAlign: lang === 'ar' ? 'left' : 'right', fontSize: '0.9rem', color: '#64748b' }}>
                {lang === 'ar' ? 'الرصيد المتاح: ' : 'Solde disponible: '}
                <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(user.balance, lang)}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-danger" style={{ flex: 1, padding: '16px' }}>
              {lang === 'ar' ? 'تأكيد السحب' : 'Confirmer le retrait'}
            </button>
            <button type="button" onClick={() => setWithdrawalModal(false)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#334155', boxShadow: 'none' }}>
              {lang === 'ar' ? 'إلغاء' : 'Annuler'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Feedback Modal (Replacement for Alert) */}
      <Modal
        isOpen={!!feedback}
        onClose={() => setFeedback(null)}
        title={feedback?.type === 'success' ? (lang === 'ar' ? 'حسناً!' : 'Succès!') : (lang === 'ar' ? 'خطأ' : 'Erreur')}
      >
        <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
          <div className={`modal-feedback-icon ${feedback?.type === 'success' ? 'feedback-success' : 'feedback-error'}`}>
            {feedback?.type === 'success' ? '✓' : '✕'}
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontWeight: 800 }}>
            {feedback?.type === 'success'
              ? (lang === 'ar' ? 'تمت العملية بنجاح' : 'Opération réussie')
              : (lang === 'ar' ? 'فشلت العملية' : 'Échec de l\'opération')}
          </h3>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '32px' }}>
            {feedback?.message}
          </p>
          <button
            onClick={() => setFeedback(null)}
            className="btn"
            style={{ width: '100%', background: feedback?.type === 'success' ? '#10b981' : '#ef4444' }}
          >
            {lang === 'ar' ? 'حسناً' : 'Compris'}
          </button>
        </div>
      </Modal>

      <MobileNav lang={lang} onToggleLang={toggleLang} />
    </div>
  )
}
