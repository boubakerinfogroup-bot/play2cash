export default function Footer({ lang = 'fr' }: { lang?: 'fr' | 'ar' }) {
    return (
        <footer style={{
            textAlign: 'center',
            padding: '20px',
            color: '#94a3b8',
            fontSize: '0.9rem',
            marginTop: 'auto'
        }}>
            © 2026 Play2Cash. {lang === 'ar' ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}.
        </footer>
    )
}
