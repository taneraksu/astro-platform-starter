// netlify/functions/chat.js
// Standalone Netlify Function for Claude AI chatbot
// Accessible at: /.netlify/functions/chat

const SYSTEM_PROMPT = `Sen "Op Dr Taner Aksu Yaş Ritmi" uygulamasının sağlık asistanısın. Orta ve ileri yaş hastalara yönelik bir ortopedi ve travmatoloji pratiğinin dijital asistanısın.

UZMANLIK ALANIN:
- Sarkopeni (yaşa bağlı kas kaybı) bilgilendirmesi
- Osteoporoz ve kemik sağlığı
- Düşme riski değerlendirmesi ve düşme önleme
- Yaşlılık egzersiz programları (direnç, denge, aerobik)
- Protein, kalsiyum ve D vitamini beslenme önerileri
- SARC-F, TUG, FES-I, Charlson, FRAX ölçeklerini açıklama
- Komorbiditeler ve kas iskelet sistemi sağlığı ilişkisi
- Motivasyonel destek ve sağlıklı yaşlanma

TEMEL KURALLAR:
1. Her zaman Türkçe yanıt ver — anlaşılır, sıcak ve destekleyici ol
2. Büyük ve açık mesajlar yaz (yaşlı bireyler için kolay okunur)
3. Kesin tanı koymaktan kaçın — sadece bilgilendir ve yönlendir
4. Ciddi semptomlar veya acil durumlar için doktor başvurusunu öner
5. Gerektiğinde Op Dr Taner Aksu ile iletişim bilgilerini paylaş
6. Bilimsel ama sade dil kullan

DOKTOR İLETİŞİM BİLGİLERİ (gerektiğinde paylaş):
- Telefon: 0542 426 05 99
- E-posta: taneraksu@gmail.com
- Adres: Zuhuratbaba Mah. Vankulu Sokak, Uğurlu Konakları B Blok No:6, Bakırköy / İstanbul
- Google Maps: https://maps.google.com/?q=40.986004,28.871471

Yanıtlarında emoji kullanabilirsin — bu mesajları daha okunabilir yapar. Her zaman umut verici ve motive edici ol.`;

exports.handler = async (event) => {
    // CORS preflight
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'API_KEY_MISSING',
                message: 'ANTHROPIC_API_KEY ortam değişkeni bulunamadı. Netlify → Site Settings → Environment Variables bölümünden ekleyip yeniden deploy edin.',
            }),
        };
    }

    let messages = [];
    try {
        const body = JSON.parse(event.body || '{}');
        messages = Array.isArray(body.messages) ? body.messages : [];
    } catch {
        return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'INVALID_JSON', message: 'Geçersiz istek formatı.' }),
        };
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                system: SYSTEM_PROMPT,
                messages,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Anthropic API error:', response.status, errText);
            let userMessage = 'Asistana ulaşılamadı. Lütfen daha sonra tekrar deneyin.';
            if (response.status === 401) userMessage = 'API anahtarı geçersiz. Netlify panelinden ANTHROPIC_API_KEY değerini kontrol edin.';
            if (response.status === 429) userMessage = 'Çok fazla istek gönderildi. Lütfen bir süre bekleyip tekrar deneyin.';
            return {
                statusCode: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'API_ERROR', message: userMessage }),
            };
        }

        const data = await response.json();
        const text = data?.content?.[0]?.text ?? '';
        return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: text }),
        };
    } catch (err) {
        console.error('Chat function exception:', err);
        return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'SERVER_ERROR', message: 'Sunucu hatası. Lütfen tekrar deneyin.' }),
        };
    }
};
