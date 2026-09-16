"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remesasService = exports.RemesasService = void 0;
const ratesService_1 = require("./ratesService");
class RemesasService {
    /**
     * Calcula la comparativa de remesas en tiempo real desde cualquier país de la diáspora
     * @param amount Monto en moneda de origen a enviar
     * @param originCountry País o moneda de origen ('COLOMBIA', 'PERU', 'CHILE', 'BRASIL', 'ARGENTINA', 'USA', 'ESPANA')
     */
    async getRemesas(amount = 100, originCountry = 'USA') {
        const country = originCountry.toUpperCase();
        const ratesData = await ratesService_1.ratesService.getRates();
        const bcvRate = ratesData.bcv.rate;
        const paraleloRate = ratesData.paralelo.rate;
        const usdtRate = ratesData.usdtBinance.rate;
        const latam = ratesData.latam;
        // Configuración de divisas de origen
        const countryConfig = {
            COLOMBIA: { code: 'COP', symbol: '$', name: 'Colombia', rateVsUsd: latam.cop.rateVsUsd, rateVsVes: latam.cop.rateVsVes },
            COP: { code: 'COP', symbol: '$', name: 'Colombia', rateVsUsd: latam.cop.rateVsUsd, rateVsVes: latam.cop.rateVsVes },
            PERU: { code: 'PEN', symbol: 'S/', name: 'Perú', rateVsUsd: latam.pen.rateVsUsd, rateVsVes: latam.pen.rateVsVes },
            PEN: { code: 'PEN', symbol: 'S/', name: 'Perú', rateVsUsd: latam.pen.rateVsUsd, rateVsVes: latam.pen.rateVsVes },
            CHILE: { code: 'CLP', symbol: '$', name: 'Chile', rateVsUsd: latam.clp.rateVsUsd, rateVsVes: latam.clp.rateVsVes },
            CLP: { code: 'CLP', symbol: '$', name: 'Chile', rateVsUsd: latam.clp.rateVsUsd, rateVsVes: latam.clp.rateVsVes },
            BRASIL: { code: 'BRL', symbol: 'R$', name: 'Brasil', rateVsUsd: latam.brl.rateVsUsd, rateVsVes: latam.brl.rateVsVes },
            BRL: { code: 'BRL', symbol: 'R$', name: 'Brasil', rateVsUsd: latam.brl.rateVsUsd, rateVsVes: latam.brl.rateVsVes },
            ARGENTINA: { code: 'ARS', symbol: '$', name: 'Argentina', rateVsUsd: latam.ars.rateVsUsd, rateVsVes: latam.ars.rateVsVes },
            ARS: { code: 'ARS', symbol: '$', name: 'Argentina', rateVsUsd: latam.ars.rateVsUsd, rateVsVes: latam.ars.rateVsVes },
            ESPANA: { code: 'EUR', symbol: '€', name: 'España / Europa', rateVsUsd: ratesData.bcv.rate / ratesData.euroBcv.rate, rateVsVes: ratesData.euroBcv.rate },
            EUR: { code: 'EUR', symbol: '€', name: 'España / Europa', rateVsUsd: ratesData.bcv.rate / ratesData.euroBcv.rate, rateVsVes: ratesData.euroBcv.rate },
            USA: { code: 'USD', symbol: '$', name: 'Estados Unidos', rateVsUsd: 1, rateVsVes: bcvRate },
            USD: { code: 'USD', symbol: '$', name: 'Estados Unidos', rateVsUsd: 1, rateVsVes: bcvRate }
        };
        const activeOrigin = countryConfig[country] || countryConfig.USA;
        const sentAmount = Math.max(1, amount || (activeOrigin.code === 'COP' ? 200000 : (activeOrigin.code === 'CLP' ? 50000 : 100)));
        const equivalentUsd = Number((sentAmount / activeOrigin.rateVsUsd).toFixed(2));
        // Plataformas y pasarelas de envío
        const rawOptions = [
            {
                plataforma: 'Binance P2P (USDT / PagoMóvil)',
                feePercent: 0.0,
                fixedFee: 0.0,
                rateMultiplier: 1.002, // USDT
                tiempo_estimado: '5 - 15 min (Inmediato)',
                metodos_pago: [`Pago local (${activeOrigin.code})`, 'PagoMóvil', 'Transferencia Bs'],
                calificacion: 4.9,
                badge: 'MEJOR TASA & CERO COMISIÓN',
                url_afiliado: 'https://p2p.binance.com/es-LA'
            },
            {
                plataforma: 'Airtm Remesas',
                feePercent: 2.8,
                fixedFee: 0.5,
                rateMultiplier: 0.985, // Mercado libre
                tiempo_estimado: '15 - 30 min',
                metodos_pago: [`Bancos ${activeOrigin.name}`, 'PagoMóvil'],
                calificacion: 4.6,
                badge: 'MULTIMONEDA DIÁSPORA',
                url_afiliado: 'https://airtm.com'
            },
            {
                plataforma: 'Zoom / Western Union Internacional',
                feePercent: 4.5,
                fixedFee: 1.5,
                rateMultiplier: 0.95, // BCV Oficial
                tiempo_estimado: '1 - 4 horas',
                metodos_pago: ['Agencias Zoom', 'PagoMóvil', 'Retiro Efectivo'],
                calificacion: 4.7,
                badge: 'RED OFICIAL AUTORIZADA',
                url_afiliado: 'https://zoom.red/remesas'
            },
            {
                plataforma: 'MoneyGram Diáspora',
                feePercent: 5.0,
                fixedFee: 2.0,
                rateMultiplier: 0.94,
                tiempo_estimado: '24 horas',
                metodos_pago: ['Depósito Bancario Directo'],
                calificacion: 4.4,
                badge: 'RED BANCARIA GLOBAL',
                url_afiliado: 'https://moneygram.com'
            }
        ];
        // Calcular rendimiento final en Bolívares
        const calculated = rawOptions.map((opt) => {
            const comision_origen = Number(((sentAmount * (opt.feePercent / 100)) + (opt.fixedFee * activeOrigin.rateVsUsd)).toFixed(2));
            const monto_neto_origen = Number(Math.max(0, sentAmount - comision_origen).toFixed(2));
            const neto_usd = monto_neto_origen / activeOrigin.rateVsUsd;
            const tasa_bs_por_usd = Number((usdtRate * opt.rateMultiplier).toFixed(2));
            const tasa_bs_por_origen = Number((tasa_bs_por_usd / activeOrigin.rateVsUsd).toFixed(4));
            const monto_final_bs = Number((neto_usd * tasa_bs_por_usd).toFixed(2));
            return {
                plataforma: opt.plataforma,
                tasa_bs_por_usd,
                tasa_bs_por_origen,
                moneda_origen: activeOrigin.code,
                comision_origen,
                monto_neto_origen,
                monto_final_bs,
                tiempo_estimado: opt.tiempo_estimado,
                metodos_pago: opt.metodos_pago,
                calificacion: opt.calificacion,
                badge: opt.badge,
                url_afiliado: opt.url_afiliado,
                es_recomendado: false
            };
        });
        calculated.sort((a, b) => b.monto_final_bs - a.monto_final_bs);
        if (calculated.length > 0) {
            calculated[0].es_recomendado = true;
        }
        const mejorOpcion = calculated[0];
        const peorOpcion = calculated[calculated.length - 1];
        const diferencia_bs_ganancia = Number((mejorOpcion.monto_final_bs - peorOpcion.monto_final_bs).toFixed(2));
        return {
            pais_origen: activeOrigin.name,
            moneda_origen: activeOrigin.code,
            simbolo_origen: activeOrigin.symbol,
            monto_enviado_origen: sentAmount,
            monto_enviado_usd: equivalentUsd,
            fecha_calculo: new Date().toISOString(),
            mejor_opcion: mejorOpcion.plataforma,
            diferencia_bs_ganancia,
            opciones: calculated
        };
    }
}
exports.RemesasService = RemesasService;
exports.remesasService = new RemesasService();
//# sourceMappingURL=remesasService.js.map