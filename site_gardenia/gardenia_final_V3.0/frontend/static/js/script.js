/**
 * GARDÊNIA — INTERAÇÕES & ESTADO
 * Moda Feminina Contemporânea & Atemporal
 */

document.addEventListener("DOMContentLoaded", () => {
    window.gardeniaScriptLoaded = true;
    // =========================================================================
    // 1. BASE DE PRODUTOS (Fallback elegante caso aberto fora do Flask)
    // =========================================================================
    const DEFAULT_PRODUCTS = [
        {
                "id": 1,
                "name": "Vestido Aurora",
                "gender": "Feminino",
                "category": "Vestidos",
                "price": 249.9,
                "old_price": 289.9,
                "tag": "Novo",
                "image": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=85",
                "description": "Vestido midi em crepe fluido com modelagem evasê, decote em V suave e alças largas. Peça versátil e confortável para o dia a dia e ocasiões especiais.",
                "sizes": [
                        "PP",
                        "P",
                        "M",
                        "G"
                ],
                "composition": "100% Viscose de Reflorestamento",
                "rating": 4.9,
                "reviews_count": 28
        },
        {
                "id": 2,
                "name": "Camisa Essencial Linho",
                "gender": "Feminino",
                "category": "Básicos",
                "price": 139.9,
                "old_price": 169.9,
                "tag": "100% Linho",
                "image": "https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=900&q=85",
                "description": "Camisa feminina clássica em tecido 100% linho respirável, com gola colarinho tradicional, fechamento por botões frontais e mangas longas com punho ajustável.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Linho Puro Certificado",
                "rating": 5.0,
                "reviews_count": 42
        },
        {
                "id": 3,
                "name": "Blazer Olive Tailored",
                "gender": "Feminino",
                "category": "Alfaiataria",
                "price": 299.9,
                "old_price": 349.9,
                "tag": "Destaque",
                "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85",
                "description": "Blazer feminino de alfaiataria na cor verde oliva, com lapela chanfrada, fechamento por botão único e bolsos embutidos com aba. Forro interno macio.",
                "sizes": [
                        "PP",
                        "P",
                        "M",
                        "G"
                ],
                "composition": "70% Lã Tropical, 30% Poliéster Reciclado",
                "rating": 4.9,
                "reviews_count": 35
        },
        {
                "id": 4,
                "name": "Tricot Serena Canelado",
                "gender": "Feminino",
                "category": "Malhas",
                "price": 179.9,
                "old_price": null,
                "tag": "Mais Vendido",
                "image": "/static/img/products/tricot_serena.jpg",
                "description": "Blusa feminina de tricot canelado de manga longa com gola redonda. Toque macio e confortável, ideal para dias amenos e sobreposições.",
                "sizes": [
                        "P",
                        "M",
                        "G"
                ],
                "composition": "60% Algodão Pima, 40% Lã Merino",
                "rating": 4.8,
                "reviews_count": 19
        },
        {
                "id": 5,
                "name": "Saia Luna Midi Evasê",
                "gender": "Feminino",
                "category": "Casual",
                "price": 159.9,
                "old_price": 189.9,
                "tag": "Tendência",
                "image": "/static/img/products/saia_midi.jpg",
                "description": "Saia midi feminina modelo evasê em sarja leve com cintura alta, fenda frontal discreta e fechamento por botão e zíper.",
                "sizes": [
                        "PP",
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "98% Algodão, 2% Elastano",
                "rating": 4.9,
                "reviews_count": 23
        },
        {
                "id": 6,
                "name": "Calça Alfaiataria Íris",
                "gender": "Feminino",
                "category": "Alfaiataria",
                "price": 229.9,
                "old_price": null,
                "tag": "Ateliê",
                "image": "/static/img/products/calca_alfaiataria.jpg",
                "description": "Calça feminina de alfaiataria reta com cintura alta, cós com passantes para cinto, pregas frontais e bolsos laterais faca.",
                "sizes": [
                        "36",
                        "38",
                        "40",
                        "42",
                        "44"
                ],
                "composition": "92% Viscose Sarjada, 8% Poliéster",
                "rating": 5.0,
                "reviews_count": 31
        },
        {
                "id": 7,
                "name": "Vestido Botânica Linho",
                "gender": "Feminino",
                "category": "Vestidos",
                "price": 269.9,
                "old_price": 310.0,
                "tag": "Exclusivo",
                "image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
                "description": "Vestido midi em mistura de linho e algodão com mangas curtas soltas, decote sutil e faixa para amarração e ajuste na cintura.",
                "sizes": [
                        "PP",
                        "P",
                        "M",
                        "G"
                ],
                "composition": "55% Linho Puro, 45% Viscose",
                "rating": 4.9,
                "reviews_count": 14
        },
        {
                "id": 8,
                "name": "Regata Ribbed Areia",
                "gender": "Feminino",
                "category": "Básicos",
                "price": 89.9,
                "old_price": null,
                "tag": "Essencial",
                "image": "/static/img/products/regata_ribbed.jpg",
                "description": "Regata feminina canelada em malha encorpada com decote halter. Modelagem ajustada ao corpo, ideal para usar sozinha ou sob blazers.",
                "sizes": [
                        "PP",
                        "P",
                        "M",
                        "G"
                ],
                "composition": "95% Algodão Pima Peruano, 5% Elastano",
                "rating": 4.7,
                "reviews_count": 51
        },
        {
                "id": 9,
                "name": "Cardigan Off-White Brisa",
                "gender": "Feminino",
                "category": "Malhas",
                "price": 209.9,
                "old_price": 249.9,
                "tag": "Conforto",
                "image": "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=85",
                "description": "Cardigan feminino oversized em tricot de ponto aberto com fechamento por botões frontais e mangas compridas com punho canelado.",
                "sizes": [
                        "P",
                        "M",
                        "G"
                ],
                "composition": "70% Acrílico Soft Touch, 30% Algodão",
                "rating": 4.9,
                "reviews_count": 17
        },
        {
                "id": 10,
                "name": "Vestido Seda Solstício",
                "gender": "Feminino",
                "category": "Vestidos",
                "price": 319.9,
                "old_price": 379.9,
                "tag": "Festa",
                "image": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85",
                "description": "Vestido longo em tecido acetinado com caimento fluido, alças finas reguláveis, decote suave e fenda lateral sutil.",
                "sizes": [
                        "PP",
                        "P",
                        "M",
                        "G"
                ],
                "composition": "100% Seda Pura Tussah",
                "rating": 5.0,
                "reviews_count": 29
        },
        {
                "id": 11,
                "name": "Blusa Gola Alta Cashmere",
                "gender": "Feminino",
                "category": "Malhas",
                "price": 189.9,
                "old_price": 219.9,
                "tag": "Inverno",
                "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85",
                "description": "Blusa de gola alta em malha macia de toque suave, manga longa e caimento ajustado. Básico essencial para dias frios.",
                "sizes": [
                        "P",
                        "M",
                        "G"
                ],
                "composition": "70% Modal, 30% Fios de Cashmere",
                "rating": 4.8,
                "reviews_count": 33
        },
        {
                "id": 12,
                "name": "Sobretudo Camel Wool",
                "gender": "Feminino",
                "category": "Casacos",
                "price": 449.9,
                "old_price": 529.9,
                "tag": "Luxo",
                "image": "/static/img/products/sobretudo_camel.jpg",
                "description": "Sobretudo feminino em lã batida na cor caramelo com gola clássica de lapela, abotoamento duplo e faixa para amarração na cintura.",
                "sizes": [
                        "36",
                        "38",
                        "40",
                        "42"
                ],
                "composition": "80% Lã Natural, 20% Poliamida Térmica",
                "rating": 5.0,
                "reviews_count": 48
        },
        {
                "id": 13,
                "name": "Calça Pantalona Linho Areia",
                "gender": "Feminino",
                "category": "Alfaiataria",
                "price": 239.9,
                "old_price": 279.9,
                "tag": "Ateliê",
                "image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85",
                "description": "Calça pantalona feminina em linho misto com cintura alta, corte reto amplo, bolsos laterais e fechamento frontal funcional.",
                "sizes": [
                        "PP",
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Linho Europeu Orgânico",
                "rating": 4.9,
                "reviews_count": 21
        },
        {
                "id": 14,
                "name": "Macacão Alfaiataria Noite",
                "gender": "Feminino",
                "category": "Alfaiataria",
                "price": 289.9,
                "old_price": 339.9,
                "tag": "Novo",
                "image": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85",
                "description": "Macacão longo de alfaiataria com decote transpassado, cintura marcada com cinto no mesmo tom e bolsos funcionais.",
                "sizes": [
                        "P",
                        "M",
                        "G"
                ],
                "composition": "96% Crepe Alfaiataria, 4% Elastano",
                "rating": 4.8,
                "reviews_count": 16
        },
        {
                "id": 15,
                "name": "Colete Alfaiataria Savile",
                "gender": "Feminino",
                "category": "Alfaiataria",
                "price": 169.9,
                "old_price": null,
                "tag": "Tendência",
                "image": "/static/img/products/colete_alfaiataria.jpg",
                "description": "Colete feminino de alfaiataria sem mangas em linho bege, com decote em V, abotoamento frontal com botões tartaruga e bolsos embutidos.",
                "sizes": [
                        "PP",
                        "P",
                        "M",
                        "G"
                ],
                "composition": "65% Viscose, 35% Linho",
                "rating": 4.9,
                "reviews_count": 39
        },
        {
                "id": 16,
                "name": "Vestido Midi Floral Vintage",
                "gender": "Feminino",
                "category": "Vestidos",
                "price": 259.9,
                "old_price": 299.9,
                "tag": "Primavera",
                "image": "/static/img/products/vestido_floral.jpg",
                "description": "Vestido midi em tecido leve com estampa floral clássica, mangas curtas, decote em V e saia com caimento solto e fluido.",
                "sizes": [
                        "PP",
                        "P",
                        "M",
                        "G"
                ],
                "composition": "100% Algodão Cambraia Suíça",
                "rating": 4.9,
                "reviews_count": 27
        },
        {
                "id": 17,
                "name": "Shorts Alfaiataria Pienza",
                "gender": "Feminino",
                "category": "Casual",
                "price": 149.9,
                "old_price": 179.9,
                "tag": "Verão",
                "image": "/static/img/products/shorts_alfaiataria.jpg",
                "description": "Shorts feminino de alfaiataria em linho com cintura alta, pregas frontais, bolsos laterais e barra dobrada estruturada.",
                "sizes": [
                        "36",
                        "38",
                        "40",
                        "42"
                ],
                "composition": "97% Algodão, 3% Elastano",
                "rating": 4.7,
                "reviews_count": 18
        },
        {
                "id": 18,
                "name": "Jaqueta Pelica Mocca",
                "gender": "Feminino",
                "category": "Casacos",
                "price": 389.9,
                "old_price": 450.0,
                "tag": "Edição Limitada",
                "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
                "description": "Jaqueta feminina curta em material sintético estilo couro na cor mocca, com zíper frontal aparente e gola alta esportiva.",
                "sizes": [
                        "P",
                        "M",
                        "G"
                ],
                "composition": "100% Couro Ecológico Premium",
                "rating": 5.0,
                "reviews_count": 41
        },
        {
                "id": 19,
                "name": "Suéter Gola V Mohair Areia",
                "gender": "Feminino",
                "category": "Malhas",
                "price": 199.9,
                "old_price": 239.9,
                "tag": "Mais Vendido",
                "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=85",
                "description": "Suéter feminino em tricot leve com decote em V, mangas longas e acabamento canelado nos punhos e na barra.",
                "sizes": [
                        "P",
                        "M",
                        "G"
                ],
                "composition": "60% Mohair Soft, 40% Algodão Pima",
                "rating": 4.9,
                "reviews_count": 25
        },
        {
                "id": 20,
                "name": "Camisa Cetim Champagne",
                "gender": "Feminino",
                "category": "Básicos",
                "price": 179.9,
                "old_price": 209.9,
                "tag": "Ateliê",
                "image": "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=85",
                "description": "Camisa feminina em cetim com brilho acetinado suave, gola camisa, fechamento frontal por botões e mangas longas.",
                "sizes": [
                        "PP",
                        "P",
                        "M",
                        "G"
                ],
                "composition": "95% Seda Acetinada, 5% Elastano",
                "rating": 4.8,
                "reviews_count": 30
        },
        {
                "id": 21,
                "name": "Vestido Chemise Linho Cru",
                "gender": "Feminino",
                "category": "Vestidos",
                "price": 239.9,
                "old_price": 279.9,
                "tag": "100% Linho",
                "image": "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=85",
                "description": "Vestido chemise midi em linho puro com abotoamento frontal completo, gola clássica e cinto de cordão para ajuste.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Linho Puro Amaciado",
                "rating": 4.9,
                "reviews_count": 22
        },
        {
                "id": 22,
                "name": "Blusa Transpassada Linho",
                "gender": "Feminino",
                "category": "Básicos",
                "price": 149.9,
                "old_price": null,
                "tag": "Casual",
                "image": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=85",
                "description": "Blusa feminina com decote transpassado em V, mangas 3/4 e amarração lateral ajustável em tecido de linho misto.",
                "sizes": [
                        "PP",
                        "P",
                        "M",
                        "G"
                ],
                "composition": "70% Linho, 30% Viscose",
                "rating": 4.7,
                "reviews_count": 15
        },
        {
                "id": 23,
                "name": "Saia Plissada Metalizada",
                "gender": "Feminino",
                "category": "Casual",
                "price": 189.9,
                "old_price": 229.9,
                "tag": "Tendência",
                "image": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=900&q=85",
                "description": "Saia midi com efeito plissado permanente em tecido com leve brilho, cós elástico confortável e forro interno.",
                "sizes": [
                        "P",
                        "M",
                        "G"
                ],
                "composition": "100% Poliéster Acetinado Microplissado",
                "rating": 4.8,
                "reviews_count": 26
        },
        {
                "id": 24,
                "name": "Top Cropped Estruturado",
                "gender": "Feminino",
                "category": "Básicos",
                "price": 119.9,
                "old_price": 139.9,
                "tag": "Novo",
                "image": "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=900&q=85",
                "description": "Top cropped feminino com decote reto, alças médias e tecido encorpado estruturado com fechamento por zíper traseiro.",
                "sizes": [
                        "PP",
                        "P",
                        "M",
                        "G"
                ],
                "composition": "100% Linho Alvejado",
                "rating": 4.9,
                "reviews_count": 19
        },
        {
                "id": 25,
                "name": "Trench Coat Tradicional Areia",
                "gender": "Feminino",
                "category": "Casacos",
                "price": 429.9,
                "old_price": 499.9,
                "tag": "Clássico",
                "image": "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85",
                "description": "Trench coat feminino tradicional na cor areia com gola ampla, abotoamento duplo, pala traseira e cinto ajustável com fivela.",
                "sizes": [
                        "36",
                        "38",
                        "40",
                        "42"
                ],
                "composition": "100% Algodão Gabardine Repelente à Água",
                "rating": 5.0,
                "reviews_count": 47
        },
        {
                "id": 26,
                "name": "Camisa Linho Riviera",
                "gender": "Masculino",
                "category": "Camisas",
                "price": 189.9,
                "old_price": 229.9,
                "tag": "100% Linho Puro",
                "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
                "description": "Camisa masculina manga longa em 100% linho leve, com colarinho macio, fechamento frontal com botões e corte regular.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Linho Europeu Puro",
                "rating": 5.0,
                "reviews_count": 38
        },
        {
                "id": 27,
                "name": "Blazer Alfaiataria Areia",
                "gender": "Masculino",
                "category": "Alfaiataria",
                "price": 349.9,
                "old_price": 399.9,
                "tag": "Destaque",
                "image": "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=900&q=85",
                "description": "Blazer masculino de alfaiataria em tom areia com lapela clássica, dois botões frontais e forro leve acetinado.",
                "sizes": [
                        "48",
                        "50",
                        "52",
                        "54"
                ],
                "composition": "65% Lã Virgem, 35% Algodão Orgânico",
                "rating": 4.9,
                "reviews_count": 27
        },
        {
                "id": 28,
                "name": "Calça Chino Confort",
                "gender": "Masculino",
                "category": "Alfaiataria",
                "price": 229.9,
                "old_price": null,
                "tag": "Essencial",
                "image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85",
                "description": "Calça masculina modelo chino em sarja de algodão com elastano, corte reto moderno, bolsos faca e passantes para cinto.",
                "sizes": [
                        "38",
                        "40",
                        "42",
                        "44"
                ],
                "composition": "97% Algodão Nobre, 3% Elastano",
                "rating": 4.9,
                "reviews_count": 44
        },
        {
                "id": 29,
                "name": "Tricot Canelado Terracota",
                "gender": "Masculino",
                "category": "Malhas",
                "price": 199.9,
                "old_price": 239.9,
                "tag": "Mais Vendido",
                "image": "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=900&q=85",
                "description": "Blusa masculina de tricot canelado com gola careca, mangas compridas e acabamento canelado na barra e punhos.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "50% Algodão Pima, 50% Lã Merino",
                "rating": 4.8,
                "reviews_count": 22
        },
        {
                "id": 30,
                "name": "Camiseta Pima Essential",
                "gender": "Masculino",
                "category": "Básicos",
                "price": 99.9,
                "old_price": null,
                "tag": "Algodão Pima",
                "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=85",
                "description": "Camiseta masculina básica em algodão nobre com toque macio, gola redonda e modelagem regular confortável.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Algodão Pima Peruano",
                "rating": 5.0,
                "reviews_count": 65
        },
        {
                "id": 31,
                "name": "Jaqueta Overshirt Safari",
                "gender": "Masculino",
                "category": "Casual",
                "price": 289.9,
                "old_price": 329.9,
                "tag": "Novo",
                "image": "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85",
                "description": "Overshirt masculina em sarja encorpada com bolsos frontais utilitários, fechamento por botões e colarinho clássico.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Sarja Pesada de Algodão",
                "rating": 4.9,
                "reviews_count": 19
        },
        {
                "id": 32,
                "name": "Camisa Polo Mercerizada",
                "gender": "Masculino",
                "category": "Camisas",
                "price": 149.9,
                "old_price": 179.9,
                "tag": "Clássico",
                "image": "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=900&q=85",
                "description": "Camisa polo masculina em algodão com acabamento liso e macio, gola e punhos canelados e vista com 2 botões.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Algodão Nobre Mercerizado",
                "rating": 4.9,
                "reviews_count": 31
        },
        {
                "id": 33,
                "name": "Costume Alfaiataria Grafite",
                "gender": "Masculino",
                "category": "Alfaiataria",
                "price": 499.9,
                "old_price": 599.9,
                "tag": "Ateliê",
                "image": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85",
                "description": "Costume masculino completo em lã fria cinza grafite, composto por paletó com forro acetinado e calça de corte slim.",
                "sizes": [
                        "48",
                        "50",
                        "52",
                        "54"
                ],
                "composition": "100% Lã Fria Super 120s",
                "rating": 5.0,
                "reviews_count": 40
        },
        {
                "id": 34,
                "name": "Bermuda Linho Mediterrâneo",
                "gender": "Masculino",
                "category": "Casual",
                "price": 169.9,
                "old_price": 199.9,
                "tag": "Verão",
                "image": "/static/img/products/bermuda_linho.jpg",
                "description": "Bermuda masculina em tecido de linho misto com cós elástico, cordão ajustável frontal e bolsos laterais práticos.",
                "sizes": [
                        "38",
                        "40",
                        "42",
                        "44"
                ],
                "composition": "55% Linho Puro, 45% Algodão",
                "rating": 4.8,
                "reviews_count": 28
        },
        {
                "id": 35,
                "name": "Suéter Gola Alta Milano",
                "gender": "Masculino",
                "category": "Malhas",
                "price": 219.9,
                "old_price": 259.9,
                "tag": "Inverno",
                "image": "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=900&q=85",
                "description": "Suéter masculino em tricot de toque aveludado com gola alta ajustada, perfeito para usar sozinho ou sob casacos e jaquetas.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Lã Merino Australiana",
                "rating": 4.9,
                "reviews_count": 34
        },
        {
                "id": 36,
                "name": "Camisa Oxford Azul Claro",
                "gender": "Masculino",
                "category": "Camisas",
                "price": 169.9,
                "old_price": 199.9,
                "tag": "Básico Nobre",
                "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=85",
                "description": "Camisa masculina manga longa em tecido oxford de algodão, com colarinho americano abotoado e corte casual clássico.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Algodão Penteado",
                "rating": 4.9,
                "reviews_count": 52
        },
        {
                "id": 37,
                "name": "Calça Alfaiataria Slim Marinho",
                "gender": "Masculino",
                "category": "Alfaiataria",
                "price": 249.9,
                "old_price": null,
                "tag": "Destaque",
                "image": "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=900&q=85",
                "description": "Calça masculina de alfaiataria em corte slim azul marinho, com passantes para cinto, bolsos embutidos e fecho por zíper e gancho.",
                "sizes": [
                        "38",
                        "40",
                        "42",
                        "44",
                        "46"
                ],
                "composition": "70% Viscose, 28% Lã, 2% Elastano",
                "rating": 5.0,
                "reviews_count": 36
        },
        {
                "id": 38,
                "name": "Cardigan Botões Lã Merino",
                "gender": "Masculino",
                "category": "Malhas",
                "price": 239.9,
                "old_price": 279.9,
                "tag": "Conforto",
                "image": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85",
                "description": "Cardigan masculino em tricot macio com decote em V, fechamento por botões frontais e punhos canelados.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Lã Merino Extrafina",
                "rating": 4.8,
                "reviews_count": 18
        },
        {
                "id": 39,
                "name": "Jaqueta Bomber Suede Café",
                "gender": "Masculino",
                "category": "Casual",
                "price": 369.9,
                "old_price": 429.9,
                "tag": "Exclusivo",
                "image": "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=900&q=85",
                "description": "Jaqueta masculina modelo bomber em suede macio marrom café, com zíper frontal de metal e gola e punhos canelados.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Suede Aveludado Premium",
                "rating": 5.0,
                "reviews_count": 29
        },
        {
                "id": 40,
                "name": "Camisa Linho Listrada Náutica",
                "gender": "Masculino",
                "category": "Camisas",
                "price": 199.9,
                "old_price": 239.9,
                "tag": "Verão",
                "image": "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=85",
                "description": "Camisa masculina em linho com padronagem listrada suave, mangas compridas dobráveis e colarinho clássico despojado.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Linho Puro Lavado",
                "rating": 4.9,
                "reviews_count": 24
        },
        {
                "id": 41,
                "name": "Camiseta Henley Nobre",
                "gender": "Masculino",
                "category": "Básicos",
                "price": 119.9,
                "old_price": null,
                "tag": "Essencial",
                "image": "/static/img/products/camiseta_henley.jpg",
                "description": "Camiseta masculina modelo henley de manga curta em malha de algodão macia, com gola redonda e peitilho de 3 botões.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Algodão Pima Peruano",
                "rating": 4.7,
                "reviews_count": 37
        },
        {
                "id": 42,
                "name": "Sobretudo Lã Italiana Charcoal",
                "gender": "Masculino",
                "category": "Casacos",
                "price": 479.9,
                "old_price": 559.9,
                "tag": "Luxo",
                "image": "/static/img/products/sobretudo_charcoal.jpg",
                "description": "Sobretudo masculino em lã batida cinza chumbo com comprimento 3/4, lapela chanfrada, fechamento por 3 botões e forro completo.",
                "sizes": [
                        "48",
                        "50",
                        "52",
                        "54"
                ],
                "composition": "85% Lã Virgem, 15% Cashmere",
                "rating": 5.0,
                "reviews_count": 31
        },
        {
                "id": 43,
                "name": "Calça Jogger Alfaiataria",
                "gender": "Masculino",
                "category": "Casual",
                "price": 219.9,
                "old_price": 249.9,
                "tag": "Tendência",
                "image": "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=900&q=85",
                "description": "Calça masculina com modelagem jogger em tecido de alfaiataria leve, cós com cordão de ajuste e punhos discretos na barra.",
                "sizes": [
                        "38",
                        "40",
                        "42",
                        "44"
                ],
                "composition": "95% Algodão Sarjado, 5% Elastano",
                "rating": 4.8,
                "reviews_count": 21
        },
        {
                "id": 44,
                "name": "Colete Tricot Lã Merino",
                "gender": "Masculino",
                "category": "Malhas",
                "price": 159.9,
                "old_price": null,
                "tag": "Clássico",
                "image": "/static/img/products/colete_tricot_merino.jpg",
                "description": "Colete masculino de tricot sem mangas em lã merino azul marinho com decote em V, ideal para sobreposição elegante com camisa.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Lã Merino Antialérgica",
                "rating": 4.9,
                "reviews_count": 19
        },
        {
                "id": 45,
                "name": "Camisa Chambray Casual Lavada",
                "gender": "Masculino",
                "category": "Camisas",
                "price": 179.9,
                "old_price": 209.9,
                "tag": "Casual",
                "image": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85",
                "description": "Camisa masculina casual manga longa em chambray de algodão com lavagem média, botões perolados e bolsos frontais.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Algodão Fio Tinto",
                "rating": 4.8,
                "reviews_count": 43
        },
        {
                "id": 46,
                "name": "Paletó Linho Rústico Tabaco",
                "gender": "Masculino",
                "category": "Alfaiataria",
                "price": 369.9,
                "old_price": 420.0,
                "tag": "Ateliê",
                "image": "https://images.unsplash.com/photo-1594938328870-9623159c8c99?auto=format&fit=crop&w=900&q=85",
                "description": "Paletó masculino desestruturado em linho rústico na cor tabaco, com lapela fina e bolsos frontais tipo patch.",
                "sizes": [
                        "48",
                        "50",
                        "52",
                        "54"
                ],
                "composition": "100% Linho Cru Pesado",
                "rating": 5.0,
                "reviews_count": 15
        },
        {
                "id": 47,
                "name": "Bermuda Chino Areia Passeio",
                "gender": "Masculino",
                "category": "Casual",
                "price": 159.9,
                "old_price": null,
                "tag": "Básico",
                "image": "/static/img/products/bermuda_chino_areia.jpg",
                "description": "Bermuda masculina chino em sarja de algodão tom areia, com bolsos embutidos, passantes de cinto e fechamento com botão e zíper.",
                "sizes": [
                        "38",
                        "40",
                        "42",
                        "44"
                ],
                "composition": "98% Algodão, 2% Elastano",
                "rating": 4.7,
                "reviews_count": 32
        },
        {
                "id": 48,
                "name": "Suéter Gola Redonda Areia",
                "gender": "Masculino",
                "category": "Malhas",
                "price": 189.9,
                "old_price": 219.9,
                "tag": "Mais Vendido",
                "image": "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=85",
                "description": "Suéter masculino em malha leve de algodão com decote careca redondo e acabamento canelado nos punhos e barra.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "80% Algodão Pima, 20% Lã Merino",
                "rating": 4.9,
                "reviews_count": 27
        },
        {
                "id": 49,
                "name": "Camisa Social Floral Noturno",
                "gender": "Masculino",
                "category": "Camisas",
                "price": 189.9,
                "old_price": 229.9,
                "tag": "Novo",
                "image": "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?auto=format&fit=crop&w=900&q=85",
                "description": "Camisa masculina de manga longa com estampa floral sutil sobre fundo escuro, gola estruturada e modelagem slim fit.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Algodão Cetim Fio 80",
                "rating": 4.8,
                "reviews_count": 14
        },
        {
                "id": 50,
                "name": "Jaqueta Trucker Sarja Oliva",
                "gender": "Masculino",
                "category": "Casual",
                "price": 319.9,
                "old_price": 369.9,
                "tag": "Destaque",
                "image": "/static/img/products/jaqueta_trucker_oliva.jpg",
                "description": "Jaqueta masculina modelo trucker em sarja verde oliva resistente, com gola dobrada, bolsos com aba no peito e botões de metal.",
                "sizes": [
                        "P",
                        "M",
                        "G",
                        "GG"
                ],
                "composition": "100% Algodão Sarja Heavy Weight",
                "rating": 5.0,
                "reviews_count": 39
        }
];

    const products = (window.products && window.products.length > 0) ? window.products : DEFAULT_PRODUCTS;
    const FREE_SHIPPING_THRESHOLD = 0;
    const STANDARD_SHIPPING_FEE = 0;

    // =========================================================================
    // 2. ESTADO DA APLICAÇÃO (localStorage)
    // =========================================================================
    let cart = JSON.parse(localStorage.getItem("gardenia_cart")) || [];
    let wishlist = JSON.parse(localStorage.getItem("gardenia_wishlist")) || [];
    let appliedCoupon = localStorage.getItem("gardenia_coupon") || null;

    const saveCart = () => localStorage.setItem("gardenia_cart", JSON.stringify(cart));
    const saveWishlist = () => localStorage.setItem("gardenia_wishlist", JSON.stringify(wishlist));

    const formatCurrency = (val) => {
        return "R$\u00A0" + Number(val).toFixed(2).replace(".", ",");
    };

    // =========================================================================
    // 3. SISTEMA DE TOASTS FLUTUANTES
    // =========================================================================
    const toastContainer = document.getElementById("toastContainer");
    function showToast(message, icon = "✦") {
        if (!toastContainer) return;
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
        toastContainer.appendChild(toast);

        // Animação de entrada
        requestAnimationFrame(() => toast.classList.add("show"));

        // Remoção suave
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 400);
        }, 3400);
    }

    // =========================================================================
    // 4. TOP BANNER & NAVBAR SCROLL & MENU MOBILE
    // =========================================================================
    const topBanner = document.getElementById("topBanner");
    const closeBanner = document.getElementById("closeBanner");
    const navbar = document.getElementById("navbar");
    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.getElementById("navLinks");
    const scrollIndicator = document.getElementById("scrollIndicator");

    if (closeBanner) {
        closeBanner.addEventListener("click", () => {
            topBanner.classList.add("hidden");
            document.body.classList.add("banner-hidden");
        });
    }

    const handleScroll = () => {
        if (navbar) {
            navbar.classList.toggle("scrolled", window.scrollY > 40);
        }

        // ScrollSpy para itens do menu
        const sections = document.querySelectorAll("section[id]");
        let currentSec = "";
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            const height = sec.offsetHeight;
            if (window.scrollY >= top && window.scrollY < top + height) {
                currentSec = sec.getAttribute("id");
            }
        });

        document.querySelectorAll(".nav-links a").forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${currentSec}`);
        });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("open");
        });
        document.querySelectorAll(".nav-links a").forEach(a => {
            a.addEventListener("click", () => navLinks.classList.remove("open"));
        });
    }

    if (scrollIndicator) {
        scrollIndicator.addEventListener("click", () => {
            const intro = document.querySelector(".intro");
            if (intro) intro.scrollIntoView({ behavior: "smooth" });
        });
    }

    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Intersection Observer para animação reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add("visible");
        });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

    // =========================================================================
    // 5. GESTÃO DA SACOLA DE COMPRAS (CART DRAWER)
    // =========================================================================
    const cartBtn = document.getElementById("cartBtn");
    const cartDrawer = document.getElementById("cartDrawer");
    const cartOverlay = document.getElementById("cartOverlay");
    const closeCartBtn = document.getElementById("closeCartBtn");
    const continueShoppingBtn = document.getElementById("continueShoppingBtn");
    const cartCountEl = document.getElementById("cartCount");
    const cartDrawerCount = document.getElementById("cartDrawerCount");
    const cartItemsList = document.getElementById("cartItemsList");
    const cartFooter = document.getElementById("cartFooter");

    const shippingBarText = document.getElementById("shippingBarText");
    const shippingProgressFill = document.getElementById("shippingProgressFill");

    const cartSubtotalEl = document.getElementById("cartSubtotal");
    const discountRow = document.getElementById("discountRow");
    const cartDiscountEl = document.getElementById("cartDiscount");
    const cartShippingEl = document.getElementById("cartShipping");
    const cartTotalEl = document.getElementById("cartTotal");

    const couponInput = document.getElementById("couponInput");
    const applyCouponBtn = document.getElementById("applyCouponBtn");
    const couponMessage = document.getElementById("couponMessage");

    function openCart() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.add("open");
            cartOverlay.classList.add("active");
            cartDrawer.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeCart() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.remove("open");
            cartOverlay.classList.remove("active");
            cartDrawer.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (cartBtn) cartBtn.addEventListener("click", openCart);
    if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
    if (continueShoppingBtn) continueShoppingBtn.addEventListener("click", closeCart);

    function updateCartUI() {
        const totalItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);
        if (cartCountEl) cartCountEl.textContent = totalItemsCount;
        if (cartDrawerCount) cartDrawerCount.textContent = `(${totalItemsCount} ${totalItemsCount === 1 ? "item" : "itens"})`;

        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <div class="empty-drawer-box">
                    <div class="empty-drawer-icon">🛍</div>
                    <h4>Sua sacola está vazia</h4>
                    <p>Descubra nossas coleções e adicione peças atemporais ao seu guarda-roupa.</p>
                    <button class="primary-btn" id="emptyCartExploreBtn">Explorar Produtos</button>
                </div>
            `;
            const exploreBtn = document.getElementById("emptyCartExploreBtn");
            if (exploreBtn) {
                exploreBtn.addEventListener("click", () => {
                    closeCart();
                    const prodSec = document.getElementById("produtos");
                    if (prodSec) prodSec.scrollIntoView({ behavior: "smooth" });
                });
            }
            if (cartFooter) cartFooter.style.display = "none";
            if (shippingProgressFill) shippingProgressFill.style.width = "0%";
            if (shippingBarText) shippingBarText.innerHTML = `🏬 <strong>Retirada Expressa no Ateliê</strong> • Grátis em até 2 horas!`;
            return;
        }

        if (cartFooter) cartFooter.style.display = "block";

        // Renderizar lista de itens
        cartItemsList.innerHTML = cart.map((item, idx) => `
            <div class="cart-item" data-idx="${idx}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <span class="item-cat">${item.category}</span>
                    <h4 class="item-name">${item.name}</h4>
                    <span class="item-size">Tamanho: <strong>${item.size || "M"}</strong></span>
                    <strong class="item-price">${formatCurrency(item.price * item.qty)}</strong>
                    <div class="cart-item-controls">
                        <div class="qty-stepper">
                            <button type="button" class="btn-qty-minus" data-idx="${idx}">-</button>
                            <span>${item.qty}</span>
                            <button type="button" class="btn-qty-plus" data-idx="${idx}">+</button>
                        </div>
                    </div>
                </div>
                <button class="remove-item-btn" data-idx="${idx}" title="Remover item" aria-label="Remover">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `).join("");

        // Subtotal e Desconto Especial Cliente+
        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const isClientPlus = Boolean(window.currentClient);
        let discount = 0;
        let discountLabel = "Desconto:";

        if (isClientPlus) {
            discount = subtotal * 0.10;
            discountLabel = "Desconto Cliente+ (10%):";
        } else if (appliedCoupon === "GARDENIA10") {
            discount = subtotal * 0.10;
            discountLabel = "Cupom GARDENIA10 (10%):";
        }

        // Retirada no Local (100% Grátis)
        const shipping = 0;
        const total = Math.max(0, subtotal - discount);

        // Barra informativa de retirada no ateliê
        if (shippingProgressFill) shippingProgressFill.style.width = "100%";
        if (shippingBarText) {
            shippingBarText.innerHTML = `🏬 <strong>Retirada Expressa no Ateliê Gardênia</strong> • Grátis em até 2 horas!`;
        }

        // Valores resumo
        if (cartSubtotalEl) cartSubtotalEl.textContent = formatCurrency(subtotal);
        if (discountRow && cartDiscountEl) {
            if (discount > 0) {
                discountRow.style.display = "flex";
                cartDiscountEl.textContent = `- ${formatCurrency(discount)}`;
            } else {
                discountRow.style.display = "none";
            }
        }
        if (cartShippingEl) {
            cartShippingEl.textContent = "Grátis no Ateliê";
            cartShippingEl.style.color = "var(--color-success)";
        }
        if (cartTotalEl) cartTotalEl.textContent = formatCurrency(total);

        // Adicionar eventos aos botões de quantidade e remoção
        document.querySelectorAll(".btn-qty-minus").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const i = parseInt(e.currentTarget.dataset.idx);
                if (cart[i].qty > 1) {
                    cart[i].qty--;
                } else {
                    cart.splice(i, 1);
                }
                saveCart();
                updateCartUI();
            });
        });

        document.querySelectorAll(".btn-qty-plus").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const i = parseInt(e.currentTarget.dataset.idx);
                cart[i].qty++;
                saveCart();
                updateCartUI();
            });
        });

        document.querySelectorAll(".remove-item-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const i = parseInt(e.currentTarget.dataset.idx);
                const removed = cart.splice(i, 1)[0];
                saveCart();
                updateCartUI();
                showToast(`"${removed.name}" removido da sacola.`);
            });
        });
    }

    function addToCart(productId, size = "M", qty = 1, openAfter = true) {
        const product = products.find(p => p.id === Number(productId));
        if (!product) return;

        const existingItem = cart.find(item => item.id === product.id && item.size === size);
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                image: product.image,
                size: size,
                qty: qty
            });
        }

        saveCart();
        updateCartUI();
        showToast(`✓ "${product.name}" (${size}) adicionado à sacola!`, "🛍");

        if (openAfter) {
            setTimeout(() => openCart(), 300);
        }
    }

    // Cupons
    if (applyCouponBtn && couponInput) {
        applyCouponBtn.addEventListener("click", () => {
            const code = couponInput.value.trim().toUpperCase();
            if (code === "GARDENIA10") {
                appliedCoupon = "GARDENIA10";
                localStorage.setItem("gardenia_coupon", appliedCoupon);
                couponMessage.textContent = "✓ Cupom de 10% OFF aplicado com sucesso!";
                couponMessage.className = "coupon-message success";
                updateCartUI();
                showToast("Cupom GARDENIA10 ativado! 10% de desconto adicionado.");
            } else if (!code) {
                couponMessage.textContent = "Digite um código de cupom.";
                couponMessage.className = "coupon-message error";
            } else {
                couponMessage.textContent = "Cupom inválido ou expirado.";
                couponMessage.className = "coupon-message error";
            }
        });
    }

    // =========================================================================
    // 6. GESTÃO DE FAVORITOS / WISHLIST
    // =========================================================================
    const wishlistBtn = document.getElementById("wishlistBtn");
    const wishlistDrawer = document.getElementById("wishlistDrawer");
    const wishlistOverlay = document.getElementById("wishlistOverlay");
    const closeWishlistBtn = document.getElementById("closeWishlistBtn");
    const wishlistCountEl = document.getElementById("wishlistCount");
    const wishlistDrawerCount = document.getElementById("wishlistDrawerCount");
    const wishlistItemsList = document.getElementById("wishlistItemsList");
    const clearWishlistBtn = document.getElementById("clearWishlistBtn");

    function openWishlist() {
        if (wishlistDrawer && wishlistOverlay) {
            wishlistDrawer.classList.add("open");
            wishlistOverlay.classList.add("active");
            wishlistDrawer.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeWishlist() {
        if (wishlistDrawer && wishlistOverlay) {
            wishlistDrawer.classList.remove("open");
            wishlistOverlay.classList.remove("active");
            wishlistDrawer.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (wishlistBtn) wishlistBtn.addEventListener("click", openWishlist);
    if (closeWishlistBtn) closeWishlistBtn.addEventListener("click", closeWishlist);
    if (wishlistOverlay) wishlistOverlay.addEventListener("click", closeWishlist);

    function updateWishlistUI() {
        const count = wishlist.length;
        if (wishlistCountEl) wishlistCountEl.textContent = count;
        if (wishlistDrawerCount) wishlistDrawerCount.textContent = `(${count} ${count === 1 ? "item" : "itens"})`;

        // Atualizar cor dos corações nos cards de produtos
        document.querySelectorAll(".heart-btn").forEach(btn => {
            const id = Number(btn.dataset.id);
            btn.classList.toggle("liked", wishlist.includes(id));
        });

        if (wishlist.length === 0) {
            wishlistItemsList.innerHTML = `
                <div class="empty-drawer-box">
                    <div class="empty-drawer-icon">♡</div>
                    <h4>Sua lista está vazia</h4>
                    <p>Salve suas peças favoritas para encontrá-las facilmente mais tarde.</p>
                </div>
            `;
            if (clearWishlistBtn) clearWishlistBtn.style.display = "none";
            return;
        }

        if (clearWishlistBtn) clearWishlistBtn.style.display = "block";

        const favoritedProducts = products.filter(p => wishlist.includes(p.id));
        wishlistItemsList.innerHTML = favoritedProducts.map(product => `
            <div class="wishlist-item" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="wishlist-item-img">
                <div class="wishlist-item-details">
                    <span class="item-cat">${product.category}</span>
                    <h4 class="item-name">${product.name}</h4>
                    <strong class="item-price">${formatCurrency(product.price)}</strong>
                    <button class="primary-btn move-to-cart-btn" data-id="${product.id}" style="padding: 6px 12px; font-size: 0.7rem; margin-top: 6px;">
                        Mover para a Sacola →
                    </button>
                </div>
                <button class="remove-wishlist-item-btn" data-id="${product.id}" title="Remover dos favoritos">
                    ✕
                </button>
            </div>
        `).join("");

        // Eventos dos botões da lista de desejos
        document.querySelectorAll(".move-to-cart-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = Number(btn.dataset.id);
                addToCart(id, "M", 1, false);
                // Remover dos favoritos
                wishlist = wishlist.filter(itemId => itemId !== id);
                saveWishlist();
                updateWishlistUI();
                showToast("Item movido para a sua sacola de compras!", "🛍");
            });
        });

        document.querySelectorAll(".remove-wishlist-item-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = Number(btn.dataset.id);
                wishlist = wishlist.filter(itemId => itemId !== id);
                saveWishlist();
                updateWishlistUI();
                showToast("Item removido dos favoritos.");
            });
        });
    }

    function toggleWishlist(productId) {
        const id = Number(productId);
        const idx = wishlist.indexOf(id);
        const product = products.find(p => p.id === id);

        if (idx > -1) {
            wishlist.splice(idx, 1);
            showToast(`"${product ? product.name : "Item"}" removido dos favoritos.`);
        } else {
            wishlist.push(id);
            showToast(`♥ "${product ? product.name : "Item"}" adicionado aos favoritos!`, "♡");
        }
        saveWishlist();
        updateWishlistUI();
    }

    document.querySelectorAll(".heart-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleWishlist(btn.dataset.id);
        });
    });

    if (clearWishlistBtn) {
        clearWishlistBtn.addEventListener("click", () => {
            wishlist = [];
            saveWishlist();
            updateWishlistUI();
            showToast("Lista de desejos limpa.");
        });
    }

    // =========================================================================
    // 7. BUSCA RÁPIDA (QUICK SEARCH MODAL)
    // =========================================================================
    const searchBtn = document.getElementById("searchBtn");
    const searchPanel = document.getElementById("searchPanel");
    const closeSearch = document.getElementById("closeSearch");
    const searchInput = document.getElementById("searchInput");
    const searchResultsArea = document.getElementById("searchResultsArea");

    function openSearch() {
        if (searchPanel) {
            searchPanel.classList.add("open");
            searchPanel.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
            setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 100);
        }
    }

    function closeSearchModal() {
        if (searchPanel) {
            searchPanel.classList.remove("open");
            searchPanel.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (searchBtn) searchBtn.addEventListener("click", openSearch);
    if (closeSearch) closeSearch.addEventListener("click", closeSearchModal);

    function performSearch(term) {
        const query = term.toLowerCase().trim();
        if (!query) {
            searchResultsArea.innerHTML = `<div class="search-empty-hint">Digite o nome de uma peça ou selecione uma sugestão acima.</div>`;
            return;
        }

        const matches = products.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            (p.gender && p.gender.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.tag && p.tag.toLowerCase().includes(query))
        );

        if (matches.length === 0) {
            searchResultsArea.innerHTML = `
                <div class="search-empty-hint">
                    Nenhum produto encontrado para "<strong>${term}</strong>".<br>
                    Experimente buscar por <em>Vestido, Linho, Blazer</em> ou <em>Casual</em>.
                </div>
            `;
            return;
        }

        searchResultsArea.innerHTML = matches.map(p => `
            <div class="search-card-item" data-id="${p.id}">
                <img src="${p.image}" alt="${p.name}" class="search-card-thumb">
                <div class="search-card-details">
                    <span>${p.category}</span>
                    <h4>${p.name}</h4>
                    <strong>${formatCurrency(p.price)}</strong>
                </div>
                <button class="search-card-btn" data-id="${p.id}">Ver Peça</button>
            </div>
        `).join("");

        // Clicar no resultado abre o Quick View do produto correspondente
        document.querySelectorAll(".search-card-item").forEach(card => {
            card.addEventListener("click", () => {
                const id = card.dataset.id;
                closeSearchModal();
                openQuickView(id);
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            performSearch(e.target.value);
        });
    }

    // Chips de buscas frequentes
    document.querySelectorAll(".search-tag-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const val = chip.dataset.search;
            if (searchInput) {
                searchInput.value = val;
                performSearch(val);
            }
        });
    });

    // =========================================================================
    // 8. MODAL DE DETALHES RÁPIDOS (QUICK VIEW)
    // =========================================================================
    const quickViewModal = document.getElementById("quickViewModal");
    const quickViewOverlay = document.getElementById("quickViewOverlay");
    const closeQuickViewBtn = document.getElementById("closeQuickViewBtn");

    const modalProductImg = document.getElementById("modalProductImg");
    const modalProductTag = document.getElementById("modalProductTag");
    const modalProductCategory = document.getElementById("modalProductCategory");
    const modalProductName = document.getElementById("modalProductName");
    const modalProductRating = document.getElementById("modalProductRating");
    const modalProductReviews = document.getElementById("modalProductReviews");
    const modalProductPrice = document.getElementById("modalProductPrice");
    const modalProductOldPrice = document.getElementById("modalProductOldPrice");
    const modalProductDesc = document.getElementById("modalProductDesc");
    const modalProductComposition = document.getElementById("modalProductComposition");
    const modalSizeOptions = document.getElementById("modalSizeOptions");
    const modalQtyMinus = document.getElementById("modalQtyMinus");
    const modalQtyPlus = document.getElementById("modalQtyPlus");
    const modalQtyVal = document.getElementById("modalQtyVal");
    const modalAddToCartBtn = document.getElementById("modalAddToCartBtn");
    const inlineSizeGuideBtn = document.getElementById("inlineSizeGuideBtn");

    let currentModalProduct = null;
    let selectedSize = "M";
    let modalQuantity = 1;

    function openQuickView(productId) {
        const product = products.find(p => p.id === Number(productId));
        if (!product) return;

        currentModalProduct = product;
        modalQuantity = 1;
        if (modalQtyVal) modalQtyVal.textContent = "1";

        modalProductImg.src = product.image;
        modalProductImg.alt = product.name;
        
        if (product.tag) {
            modalProductTag.style.display = "block";
            modalProductTag.textContent = product.tag;
        } else {
            modalProductTag.style.display = "none";
        }

        modalProductCategory.textContent = product.category;
        modalProductName.textContent = product.name;
        modalProductRating.textContent = product.rating || "5.0";
        modalProductReviews.textContent = `(${product.reviews_count || 24} avaliações)`;
        modalProductPrice.textContent = formatCurrency(product.price);
        const modalProductClubPrice = document.getElementById("modalProductClubPrice");
        if (modalProductClubPrice) {
            modalProductClubPrice.textContent = formatCurrency(product.price * 0.9);
        }
        
        if (product.old_price) {
            modalProductOldPrice.style.display = "inline";
            modalProductOldPrice.textContent = formatCurrency(product.old_price);
        } else {
            modalProductOldPrice.style.display = "none";
        }

        modalProductDesc.textContent = product.description || "Peça com corte contemporâneo e caimento anatômico perfeito.";
        modalProductComposition.textContent = product.composition || "Fibras Naturais Selecionadas";

        // Gerar tamanhos
        const sizes = product.sizes || ["PP", "P", "M", "G", "GG"];
        selectedSize = sizes[0] || "M";

        modalSizeOptions.innerHTML = sizes.map((s, idx) => `
            <button type="button" class="size-btn-pill ${idx === 0 ? "active" : ""}" data-size="${s}">
                ${s}
            </button>
        `).join("");

        modalSizeOptions.querySelectorAll(".size-btn-pill").forEach(btn => {
            btn.addEventListener("click", () => {
                modalSizeOptions.querySelectorAll(".size-btn-pill").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                selectedSize = btn.dataset.size;
            });
        });

        quickViewModal.classList.add("open");
        quickViewOverlay.classList.add("active");
        quickViewModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeQuickView() {
        if (quickViewModal && quickViewOverlay) {
            quickViewModal.classList.remove("open");
            quickViewOverlay.classList.remove("active");
            quickViewModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (closeQuickViewBtn) closeQuickViewBtn.addEventListener("click", closeQuickView);
    if (quickViewOverlay) quickViewOverlay.addEventListener("click", closeQuickView);

    if (modalQtyMinus && modalQtyPlus && modalQtyVal) {
        modalQtyMinus.addEventListener("click", () => {
            if (modalQuantity > 1) {
                modalQuantity--;
                modalQtyVal.textContent = modalQuantity;
            }
        });
        modalQtyPlus.addEventListener("click", () => {
            modalQuantity++;
            modalQtyVal.textContent = modalQuantity;
        });
    }

    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener("click", () => {
            if (currentModalProduct) {
                addToCart(currentModalProduct.id, selectedSize, modalQuantity, true);
                closeQuickView();
            }
        });
    }

    // =========================================================================
    // 9. INICIALIZAÇÃO DO GRID & EVENTOS DOS PRODUTOS
    // =========================================================================
    function initProductGrid() {
        const productGrid = document.getElementById("productGrid");
        if (!productGrid) return;

        // Se a página foi aberta diretamente como arquivo HTML sem o Flask
        if (productGrid.innerHTML.includes("{%") || productGrid.children.length === 0 || productGrid.querySelectorAll(".product-card").length === 0) {
            productGrid.innerHTML = products.map(product => `
                <article class="product-card reveal visible" data-id="${product.id}" data-gender="${product.gender || "Feminino"}" data-category="${product.category}" data-name="${product.name}">
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name}" loading="lazy" class="product-thumb" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85';">
                        ${product.tag ? `<span class="product-badge">${product.tag}</span>` : ""}
                        <button class="heart-btn ${wishlist.includes(product.id) ? "liked" : ""}" data-id="${product.id}" aria-label="Adicionar aos favoritos" title="Favoritar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                        <div class="product-actions-overlay">
                            <button class="quick-view-btn" data-id="${product.id}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                Olhar Rápido
                            </button>
                            <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Adicionar à Sacola
                            </button>
                        </div>
                    </div>
                    <div class="product-meta">
                        <div class="product-meta-header">
                            <span class="product-cat">${product.category} • ${product.gender || "Feminino"}</span>
                            <div class="product-rating">
                                <span class="stars">★</span>
                                <span class="rating-num">${product.rating || "5.0"}</span>
                            </div>
                        </div>
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price-box">
                            ${product.old_price ? `<span class="old-price">${formatCurrency(product.old_price)}</span>` : ""}
                            <strong class="current-price">${formatCurrency(product.price)}</strong>
                        </div>
                        <div class="product-club-price" title="Preço exclusivo para clientes com cadastro">
                            <span class="club-badge">Cliente+</span>
                            <strong class="club-val">${formatCurrency(product.price * 0.9)}</strong>
                            <span class="club-hint">(10% OFF c/ CPF)</span>
                        </div>
                        <div class="product-installment-line">
                            ou 3x de ${formatCurrency(product.price / 3)} s/ juros
                        </div>
                        <div class="product-swatches" aria-label="Cores disponíveis">
                            <span class="swatch-dot active" style="background:#dfbe80;" title="Areia Nobre"></span>
                            <span class="swatch-dot" style="background:#4b5342;" title="Verde Oliva"></span>
                            <span class="swatch-dot" style="background:#23272e;" title="Preto Noite"></span>
                        </div>
                    </div>
                </article>
            `).join("");
            if (typeof observer !== "undefined") {
                productGrid.querySelectorAll(".reveal").forEach(el => observer.observe(el));
            }
        }

        // Botões Adicionar à Sacola nos cards
        document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const originalContent = btn.innerHTML;
                btn.innerHTML = `<span>✓ Adicionado</span>`;
                addToCart(id, "M", 1, true);
                setTimeout(() => btn.innerHTML = originalContent, 1400);
            });
        });

        // Botões Favoritar (Coração) nos cards
        document.querySelectorAll(".heart-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleWishlist(btn.dataset.id);
            });
        });

        // Botões Olhar Rápido
        document.querySelectorAll(".quick-view-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                openQuickView(btn.dataset.id);
            });
        });

        // Clique na imagem do produto para abrir detalhes
        document.querySelectorAll(".product-image-container").forEach(box => {
            box.addEventListener("click", (e) => {
                if (e.target.closest(".heart-btn") || e.target.closest(".add-to-cart-btn") || e.target.closest(".quick-view-btn")) return;
                const card = box.closest(".product-card");
                if (card) openQuickView(card.dataset.id);
            });
        });
    }

    // =========================================================================
    // 10. DEPARTAMENTOS & FILTROS DE CATEGORIA (FEMININO / MASCULINO / TODOS)
    // =========================================================================
    let currentDept = "Feminino";
    let currentCategory = "Todos";

    const DEPT_CATEGORIES = {
        "Feminino": ["Todos", "Vestidos", "Básicos", "Alfaiataria", "Malhas", "Casual", "Casacos"],
        "Masculino": ["Todos", "Camisas", "Alfaiataria", "Básicos", "Malhas", "Casual", "Casacos"],
        "Todos": ["Todos", "Vestidos", "Camisas", "Alfaiataria", "Básicos", "Malhas", "Casual", "Casacos"]
    };

    const emptyProducts = document.getElementById("emptyProducts");
    const resetFilterBtn = document.getElementById("resetFilterBtn");

    function renderCategoryFilters(dept) {
        const filtersContainer = document.getElementById("filters");
        if (!filtersContainer) return;

        const categories = DEPT_CATEGORIES[dept] || DEPT_CATEGORIES["Todos"];
        filtersContainer.innerHTML = categories.map(cat => `
            <button class="filter ${cat === currentCategory ? "active" : ""}" data-filter="${cat}">
                ${cat === "Todos" ? "Todas as Categorias" : cat}
            </button>
        `).join("");

        filtersContainer.querySelectorAll(".filter").forEach(btn => {
            btn.addEventListener("click", () => {
                currentCategory = btn.dataset.filter;
                filtersContainer.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                filterProducts();
            });
        });
    }

    function filterProducts() {
        const cards = document.querySelectorAll(".product-card");
        let visibleCount = 0;

        cards.forEach(card => {
            const cardGender = (card.dataset.gender || "Feminino").trim();
            const cardCat = (card.dataset.category || "").trim();
            const matchDept = (currentDept === "Todos" || cardGender.toLowerCase() === currentDept.toLowerCase());
            const matchCat = (currentCategory === "Todos" || cardCat.toLowerCase() === currentCategory.toLowerCase());
            const isVisible = matchDept && matchCat;

            card.classList.toggle("hidden", !isVisible);
            if (isVisible) {
                card.classList.add("visible");
                card.style.display = "";
                card.style.opacity = "1";
                card.style.transform = "none";
                visibleCount++;
            }
        });

        if (emptyProducts) {
            emptyProducts.style.display = (visibleCount === 0) ? "block" : "none";
        }
    }

    function setDepartment(dept) {
        currentDept = dept;
        currentCategory = "Todos";

        // Atualizar abas
        document.querySelectorAll(".dept-tab").forEach(tab => {
            const isActive = tab.dataset.dept === dept;
            tab.classList.toggle("active", isActive);
            tab.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        renderCategoryFilters(dept);
        filterProducts();
    }

    // Cliques nas abas de departamento
    document.querySelectorAll(".dept-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            setDepartment(tab.dataset.dept);
        });
    });

    // Cliques nos links da navbar "Feminino" e "Masculino"
    document.querySelectorAll(".nav-dept-link").forEach(link => {
        link.addEventListener("click", (e) => {
            const dept = link.dataset.dept;
            if (dept) {
                setDepartment(dept);
                showToast(`Exibindo Coleção ${dept}`, dept === "Feminino" ? "♀" : "♂");
            }
        });
    });

    if (resetFilterBtn) {
        resetFilterBtn.addEventListener("click", () => {
            setDepartment("Todos");
        });
    }

    // Cliques nos botões de Coleções ("Descobrir Peças" / "Ver todas as peças")
    document.querySelectorAll(".collection-card, .collection-link-btn").forEach(el => {
        el.addEventListener("click", (e) => {
            const cat = el.dataset.category;
            if (cat) {
                setDepartment("Todos");
                currentCategory = cat;
                renderCategoryFilters("Todos");
                filterProducts();
                const prodSec = document.getElementById("produtos");
                if (prodSec) prodSec.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    const viewAllCollectionsBtn = document.getElementById("viewAllCollectionsBtn");
    if (viewAllCollectionsBtn) {
        viewAllCollectionsBtn.addEventListener("click", () => {
            setDepartment("Todos");
            const prodSec = document.getElementById("produtos");
            if (prodSec) prodSec.scrollIntoView({ behavior: "smooth" });
        });
    }

    // =========================================================================
    // 10. PERSONAL STYLIST VIRTUAL QUIZ
    // =========================================================================
    const styleButtons = document.querySelectorAll(".style-btn");
    const styleResultTitle = document.getElementById("styleResultTitle");
    const styleResultText = document.getElementById("styleResultText");
    const styleFilterActionBtn = document.getElementById("styleFilterActionBtn");

    styleButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            styleButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const styleName = btn.dataset.style;
            const desc = btn.dataset.desc;
            const cat = btn.dataset.cat;

            if (styleResultTitle) styleResultTitle.textContent = `Estilo ${styleName}`;
            if (styleResultText) styleResultText.textContent = desc;
            if (styleFilterActionBtn) {
                styleFilterActionBtn.textContent = `Ver Peças de ${cat} →`;
                styleFilterActionBtn.dataset.target = cat;
            }
        });
    });

    if (styleFilterActionBtn) {
        styleFilterActionBtn.addEventListener("click", () => {
            const targetCat = styleFilterActionBtn.dataset.target || "Todos";
            applyFilter(targetCat);
            const prodSec = document.getElementById("produtos");
            if (prodSec) prodSec.scrollIntoView({ behavior: "smooth" });
            showToast(`Filtrando seleção para ${targetCat}.`);
        });
    }

    // =========================================================================
    // 11. MODAIS INFORMATIVOS (GUIA DE MEDIDAS & TROCAS & POLÍTICAS)
    // =========================================================================
    const measureModal = document.getElementById("measureModal");
    const measureOverlay = document.getElementById("measureOverlay");
    const closeMeasureBtn = document.getElementById("closeMeasureBtn");
    const openMeasurementGuideBtn = document.getElementById("openMeasurementGuideBtn");
    const footerMeasureBtn = document.getElementById("footerMeasureBtn");

    function openMeasureModal() {
        if (measureModal && measureOverlay) {
            measureModal.classList.add("open");
            measureOverlay.classList.add("active");
            measureModal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeMeasureModal() {
        if (measureModal && measureOverlay) {
            measureModal.classList.remove("open");
            measureOverlay.classList.remove("active");
            measureModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (openMeasurementGuideBtn) openMeasurementGuideBtn.addEventListener("click", openMeasureModal);
    if (footerMeasureBtn) footerMeasureBtn.addEventListener("click", openMeasureModal);
    if (inlineSizeGuideBtn) inlineSizeGuideBtn.addEventListener("click", () => {
        closeQuickView();
        openMeasureModal();
    });
    if (closeMeasureBtn) closeMeasureBtn.addEventListener("click", closeMeasureModal);
    if (measureOverlay) measureOverlay.addEventListener("click", closeMeasureModal);

    // Modal de Trocas
    const returnsModal = document.getElementById("returnsModal");
    const returnsOverlay = document.getElementById("returnsOverlay");
    const closeReturnsBtn = document.getElementById("closeReturnsBtn");
    const openReturnsPolicyBtn = document.getElementById("openReturnsPolicyBtn");
    const footerReturnsBtn = document.getElementById("footerReturnsBtn");

    function openReturnsModal() {
        if (returnsModal && returnsOverlay) {
            returnsModal.classList.add("open");
            returnsOverlay.classList.add("active");
            returnsModal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeReturnsModal() {
        if (returnsModal && returnsOverlay) {
            returnsModal.classList.remove("open");
            returnsOverlay.classList.remove("active");
            returnsModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (openReturnsPolicyBtn) openReturnsPolicyBtn.addEventListener("click", openReturnsModal);
    if (footerReturnsBtn) footerReturnsBtn.addEventListener("click", openReturnsModal);
    if (closeReturnsBtn) closeReturnsBtn.addEventListener("click", closeReturnsModal);
    if (returnsOverlay) returnsOverlay.addEventListener("click", closeReturnsModal);

    const footerFaqBtn = document.getElementById("footerFaqBtn");
    if (footerFaqBtn) {
        footerFaqBtn.addEventListener("click", () => {
            showToast("Para dúvidas frequentes ou atendimento humano, chame nosso ateliê pelo WhatsApp!", "🌿");
        });
    }

    // =========================================================================
    // 12. CHECKOUT & FINALIZAÇÃO DE PEDIDOS
    // =========================================================================
    const checkoutModal = document.getElementById("checkoutModal");
    const checkoutOverlay = document.getElementById("checkoutOverlay");
    const closeCheckoutBtn = document.getElementById("closeCheckoutBtn");
    const startCheckoutBtn = document.getElementById("startCheckoutBtn");
    const checkoutForm = document.getElementById("checkoutForm");
    const checkoutItemsSummary = document.getElementById("checkoutItemsSummary");
    const checkoutTotals = document.getElementById("checkoutTotals");

    function openCheckout() {
        if (cart.length === 0) {
            showToast("Adicione ao menos uma peça à sua sacola para finalizar.", "⚠️");
            return;
        }

        closeCart();

        // Renderizar resumo de itens
        if (checkoutItemsSummary) {
            checkoutItemsSummary.innerHTML = cart.map(item => `
                <div class="checkout-summary-row">
                    <span>${item.qty}x ${item.name} (${item.size || "M"})</span>
                    <strong>${formatCurrency(item.price * item.qty)}</strong>
                </div>
            `).join("");
        }

        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        
        function renderCheckoutTotals(cpfDigits = "") {
            const hasCpfDiscount = Boolean(window.currentClient) || (cpfDigits && cpfDigits.length === 11);
            let discount = 0;
            let discountTitle = "";

            if (hasCpfDiscount) {
                discount = subtotal * 0.10;
                discountTitle = "Desconto Especial Cliente+ (10% OFF):";
            } else if (appliedCoupon === "GARDENIA10") {
                discount = subtotal * 0.10;
                discountTitle = "Desconto Cupom GARDENIA10 (10% OFF):";
            }
            const shipping = 0;
            const total = Math.max(0, subtotal - discount);

            if (checkoutTotals) {
                checkoutTotals.innerHTML = `
                    <div class="summary-line" style="margin-top: 10px;">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(subtotal)}</span>
                    </div>
                    ${discount > 0 ? `
                    <div class="summary-line discount-line" style="color: #2e7d32; font-weight: 600;">
                        <span>${discountTitle}</span>
                        <span>- ${formatCurrency(discount)}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: #2e7d32; background: rgba(46,125,50,0.08); padding: 4px 8px; border-radius: 4px; margin-bottom: 6px;">
                        ✓ Preço com desconto especial de cadastro ativado!
                    </div>` : `
                    <div class="summary-line" style="font-size: 0.78rem; color: var(--color-muted);">
                        <span>Preço Especial Cliente+:</span>
                        <span style="color: var(--color-accent);">Digite seu CPF abaixo para 10% OFF</span>
                    </div>`}
                    <div class="summary-line">
                        <span>Retirada:</span>
                        <span style="color: var(--color-success); font-weight: 600;">GRÁTIS (Loja Física)</span>
                    </div>
                    <div class="summary-line total-line" style="font-size: 1.25rem; font-weight: 700; margin-top: 8px;">
                        <span>Total Final:</span>
                        <strong style="color: var(--color-ink);">${formatCurrency(total)}</strong>
                    </div>
                `;
            }
        }

        const initialCpf = (window.currentClient?.cpf || "").replace(/\D/g, "");
        renderCheckoutTotals(initialCpf);

        // Preenchimento automático com dados do cliente logado, se houver
        const nameInput = document.getElementById("checkoutName");
        const phoneInput = document.getElementById("checkoutPhone");
        const cpfInput = document.getElementById("checkoutCpf");

        if (window.currentClient) {
            if (nameInput && !nameInput.value) nameInput.value = window.currentClient.name || "";
            if (phoneInput && !phoneInput.value) phoneInput.value = window.currentClient.phone || "";
            if (cpfInput && !cpfInput.value) cpfInput.value = window.currentClient.cpf || "";
        }

        if (cpfInput) {
            cpfInput.oninput = (e) => {
                let v = e.target.value.replace(/\D/g, "");
                if (v.length > 11) v = v.slice(0, 11);
                if (v.length > 9) v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
                else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d{1,3})$/, "$1.$2.$3");
                else if (v.length > 3) v = v.replace(/^(\d{3})(\d{1,3})$/, "$1.$2");
                e.target.value = v;

                const digits = v.replace(/\D/g, "");
                renderCheckoutTotals(digits);
            };
        }

        if (checkoutModal && checkoutOverlay) {
            checkoutModal.classList.add("open");
            checkoutOverlay.classList.add("active");
            checkoutModal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeCheckout() {
        if (checkoutModal && checkoutOverlay) {
            checkoutModal.classList.remove("open");
            checkoutOverlay.classList.remove("active");
            checkoutModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (startCheckoutBtn) startCheckoutBtn.addEventListener("click", openCheckout);
    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener("click", closeCheckout);
    if (checkoutOverlay) checkoutOverlay.addEventListener("click", closeCheckout);

    // Máscara dinâmica de CPF no checkout
    const checkoutCpfInput = document.getElementById("checkoutCpf");
    if (checkoutCpfInput) {
        checkoutCpfInput.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 11) v = v.slice(0, 11);
            if (v.length > 9) {
                v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
            } else if (v.length > 6) {
                v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
            } else if (v.length > 3) {
                v = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
            }
            e.target.value = v;
        });
    }

    // Modal de Confirmação de Pedido Realizado
    const orderSuccessModal = document.getElementById("orderSuccessModal");
    const orderSuccessOverlay = document.getElementById("orderSuccessOverlay");
    const closeOrderSuccessBtn = document.getElementById("closeOrderSuccessBtn");
    const finishOrderSuccessBtn = document.getElementById("finishOrderSuccessBtn");
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");
    const copyOrderBtn = document.getElementById("copyOrderBtn");
    const closeReturnsModalBtn = document.getElementById("closeReturnsModalBtn");

    let reservationCountdownInterval = null;

    function startReservationCountdown() {
        if (reservationCountdownInterval) clearInterval(reservationCountdownInterval);
        let totalSeconds = 48 * 3600; // 48 horas de reserva garantida no balcão
        const hoursEl = document.getElementById("countdownHours");
        const minsEl = document.getElementById("countdownMinutes");
        const secsEl = document.getElementById("countdownSeconds");

        function tick() {
            if (totalSeconds <= 0) {
                if (reservationCountdownInterval) clearInterval(reservationCountdownInterval);
                return;
            }
            totalSeconds--;
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            if (hoursEl) hoursEl.textContent = String(h).padStart(2, "0");
            if (minsEl) minsEl.textContent = String(m).padStart(2, "0");
            if (secsEl) secsEl.textContent = String(s).padStart(2, "0");
        }
        tick();
        reservationCountdownInterval = setInterval(tick, 1000);
    }

    function launchOrderConfetti() {
        const canvas = document.getElementById("orderConfettiCanvas");
        if (!canvas) return;
        canvas.style.display = "block";
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const pieces = [];
        const colors = ["#C4704F", "#5B6B54", "#D4AF37", "#2E7D32", "#E65100", "#FAF8F5"];
        for (let i = 0; i < 80; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height * 0.4,
                w: Math.random() * 8 + 4,
                h: Math.random() * 10 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                vy: Math.random() * 3 + 2,
                vx: (Math.random() - 0.5) * 2.5,
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 8
            });
        }
        let frame = 0;
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;
            pieces.forEach(p => {
                p.y += p.vy;
                p.x += p.vx;
                p.rotation += p.vRot;
                if (p.y < canvas.height) active = true;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
            frame++;
            if (active && frame < 180) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.style.display = "none";
            }
        }
        requestAnimationFrame(animate);
    }

    function closeOrderSuccess() {
        if (reservationCountdownInterval) clearInterval(reservationCountdownInterval);
        if (orderSuccessModal && orderSuccessOverlay) {
            orderSuccessModal.classList.remove("open");
            orderSuccessOverlay.classList.remove("active");
            orderSuccessModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (closeOrderSuccessBtn) closeOrderSuccessBtn.addEventListener("click", closeOrderSuccess);
    if (finishOrderSuccessBtn) finishOrderSuccessBtn.addEventListener("click", closeOrderSuccess);
    if (orderSuccessOverlay) orderSuccessOverlay.addEventListener("click", closeOrderSuccess);
    if (closeReturnsModalBtn) closeReturnsModalBtn.addEventListener("click", closeReturnsModal);
    let lastOrderDetails = null;

    function generateOrderPdf(orderData) {
        if (!orderData) {
            showToast("Dados do pedido não encontrados para gerar PDF.", "⚠️");
            return;
        }

        const jspdfModule = window.jspdf || (window.jspdf && window.jspdf.jsPDF ? window.jspdf : null);
        if (!jspdfModule || !jspdfModule.jsPDF) {
            showToast("Gerador de PDF carregando, tente novamente em instantes.", "⚠️");
            return;
        }

        const { jsPDF } = jspdfModule;
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        // Topo elegante
        doc.setFillColor(29, 33, 29);
        doc.rect(0, 0, 210, 32, "F");

        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text("GARDENIA MODAS", 105, 14, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(223, 190, 128);
        doc.text("MODA FEMININA & MASCULINA ATEMPORAL - NOTINHA DE COMPRA", 105, 21, { align: "center" });

        doc.setFontSize(7.5);
        doc.setTextColor(210, 210, 210);
        doc.text("Praca Cel. Joaquim Jose, 120 - Centro, Sao Joao da Boa Vista / SP - CNPJ: 47.892.103/0001-52", 105, 27, { align: "center" });

        // Protocolo
        let y = 42;
        doc.setFillColor(247, 245, 240);
        doc.roundedRect(15, y, 180, 20, 2.5, 2.5, "F");

        doc.setTextColor(29, 33, 29);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`PROTOCOLO: ${orderData.code}`, 20, y + 8);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        doc.text(`Emitido em: ${orderData.date} as ${orderData.time}`, 20, y + 15);
        doc.text("Status: RESERVADO PARA RETIRADA NO ATELIE", 115, y + 15);

        // Dados do Cliente
        y = 69;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(29, 33, 29);
        doc.text("DADOS DO CLIENTE / TITULAR DA RETIRADA", 15, y);

        y += 4;
        doc.setDrawColor(210, 210, 210);
        doc.line(15, y, 195, y);

        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Nome: ${orderData.clientName}`, 15, y);
        doc.text(`Telefone: ${orderData.clientPhone}`, 120, y);

        y += 5.5;
        doc.text(`CPF: ${orderData.clientCpf} ${orderData.hasClubDiscount ? "(*Cliente+ 10% OFF ativado*)" : ""}`, 15, y);
        doc.text(`Forma de Pagamento: ${orderData.paymentMethod}`, 120, y);

        // Itens
        y += 13;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.text("ITENS DA NOTINHA", 15, y);

        y += 4;
        doc.setFillColor(236, 233, 226);
        doc.rect(15, y, 180, 7.5, "F");
        doc.setFontSize(8.5);
        doc.setTextColor(29, 33, 29);
        doc.text("Peca / Produto", 18, y + 5);
        doc.text("Tamanho", 120, y + 5);
        doc.text("Qtd.", 145, y + 5);
        doc.text("Valor", 172, y + 5);

        y += 7.5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        orderData.items.forEach((item, idx) => {
            const rowY = y + (idx * 7.5) + 5;
            if (idx % 2 === 1) {
                doc.setFillColor(250, 248, 245);
                doc.rect(15, y + (idx * 7.5), 180, 7.5, "F");
            }
            doc.text(`${item.name}`, 18, rowY);
            doc.text(`${item.size || "M"}`, 122, rowY);
            doc.text(`${item.qty}x`, 147, rowY);
            doc.text(`${item.totalStr}`, 172, rowY);
        });

        y += (orderData.items.length * 7.5) + 5;
        doc.line(15, y, 195, y);

        // Resumo
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("Subtotal:", 125, y);
        doc.text(`${orderData.subtotalStr}`, 175, y);

        if (orderData.discountVal > 0) {
            y += 5.5;
            doc.setTextColor(46, 125, 50);
            doc.setFont("helvetica", "bold");
            doc.text(orderData.discountTitle || "Desconto Especial:", 115, y);
            doc.text(`- ${orderData.discountStr}`, 175, y);
        }

        y += 5.5;
        doc.setTextColor(46, 125, 50);
        doc.setFont("helvetica", "normal");
        doc.text("Taxa de Retirada no Local:", 125, y);
        doc.text("GRATIS", 175, y);

        y += 7;
        doc.setFillColor(29, 33, 29);
        doc.roundedRect(110, y - 4.5, 85, 11, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.text("TOTAL PAGO:", 114, y + 2.5);
        doc.setTextColor(223, 190, 128);
        doc.text(`${orderData.totalStr}`, 168, y + 2.5);

        // Instruções
        y += 18;
        doc.setFillColor(248, 246, 240);
        doc.setDrawColor(223, 190, 128);
        doc.roundedRect(15, y, 180, 30, 2, 2, "FD");

        doc.setTextColor(29, 33, 29);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text("INFORMACOES PARA RETIRADA NO ATELIE:", 20, y + 6);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(70, 70, 70);
        doc.text("1. Local de Retirada: Praca Cel. Joaquim Jose, 120 - Centro, Sao Joao da Boa Vista / SP", 20, y + 12);
        doc.text("2. Horario: Segunda a Sexta das 09h as 18h30 | Sabados das 09h as 13h30", 20, y + 17);
        doc.text("3. Identificacao: Apresente esta notinha ou informe o protocolo / CPF no balcao.", 20, y + 22);
        doc.text("4. Embalagem especial ecologica ja preparada sem custo adicional.", 20, y + 26);

        // Rodapé
        doc.setFontSize(7.5);
        doc.setTextColor(140, 140, 140);
        doc.text("Gardenia Modas - Projeto UNIFEOB - Curso de Ciencia da Computacao", 105, 287, { align: "center" });

        const filename = `Notinha_Gardenia_${orderData.code.replace("#", "")}.pdf`;
        doc.save(filename);
        showToast(`Notinha salva em PDF: ${filename}`, "📥");
    }

    function copyOrderSummary(orderData) {
        if (!orderData) return;
        const text = [
            `✦ GARDÊNIA MODAS — NOTINHA DO PEDIDO ✦`,
            `Protocolo: ${orderData.code}`,
            `Data: ${orderData.date} às ${orderData.time}`,
            `Cliente: ${orderData.clientName} (CPF: ${orderData.clientCpf})`,
            `Telefone: ${orderData.clientPhone}`,
            `-------------------------------------------`,
            `ITENS RESERVADOS:`,
            ...orderData.items.map(it => `• ${it.qty}x ${it.name} (${it.size}) — ${it.totalStr}`),
            `-------------------------------------------`,
            `Total a Pagar: ${orderData.totalStr} (${orderData.paymentMethod})`,
            `Ponto de Retirada: Praça Cel. Joaquim José, 120 - Centro, São João da Boa Vista/SP`,
            `Pronto para retirada em até 2 horas úteis!`
        ].join("\n");

        navigator.clipboard.writeText(text).then(() => {
            showToast("Dados do pedido copiados para a área de transferência!", "📋");
        }).catch(() => {
            showToast("Protocolo: " + orderData.code, "📋");
        });
    }

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener("click", () => {
            generateOrderPdf(lastOrderDetails);
        });
    }

    if (copyOrderBtn) {
        copyOrderBtn.addEventListener("click", () => {
            copyOrderSummary(lastOrderDetails);
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("checkoutName").value.trim();
            const phone = document.getElementById("checkoutPhone").value.trim();
            const cpf = document.getElementById("checkoutCpf")?.value.trim() || "";
            const payment = document.querySelector('input[name="paymentMethod"]:checked')?.value || "PIX";

            if (cpf && cpf.replace(/\D/g, "").length !== 11) {
                showToast("Por favor, informe um CPF válido com 11 dígitos.", "⚠️");
                document.getElementById("checkoutCpf")?.focus();
                return;
            }

            const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
            const cpfDigits = (cpf || "").replace(/\D/g, "");
            const hasCpfDiscount = Boolean(window.currentClient) || cpfDigits.length === 11;
            let discount = 0;

            if (hasCpfDiscount || appliedCoupon === "GARDENIA10") {
                discount = subtotal * 0.10; // 10% OFF Preço Especial de Cadastro / Cliente+
            }
            if (payment === "PIX") {
                discount += (subtotal - discount) * 0.05; // 5% de desconto imediato no PIX
            }
            const total = Math.max(0, subtotal - discount);

            // Gerar código único de protocolo do pedido
            const orderYear = new Date().getFullYear();
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const orderCode = `#GD-${orderYear}-${randomCode}`;

            // Preencher campos do modal de sucesso
            const codeEl = document.getElementById("orderSuccessCode");
            const nameEl = document.getElementById("orderSuccessClientName");
            const phoneEl = document.getElementById("orderSuccessClientPhone");
            const cpfEl = document.getElementById("orderSuccessClientCpf");
            const paymentBox = document.getElementById("orderSuccessPaymentBox");
            const itemsEl = document.getElementById("orderSuccessItems");
            const totalEl = document.getElementById("orderSuccessTotal");

            if (codeEl) codeEl.textContent = orderCode;
            if (nameEl) nameEl.textContent = name;
            if (phoneEl) phoneEl.textContent = phone;
            if (cpfEl) cpfEl.textContent = cpf || "Identificação no Balcão";

            if (paymentBox) {
                if (payment === "PIX") {
                    paymentBox.innerHTML = `
                        <div class="pix-box-styled">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="font-size:0.85rem;">Chave PIX (CNPJ Gardênia):</strong>
                                <span class="pickup-free-pill">5% OFF Aplicado</span>
                            </div>
                            <div class="pix-key-display">
                                <span id="pixKeyVal">47.892.103/0001-52</span>
                                <button type="button" class="btn-copy-pix" id="copyPixBtn">Copiar Chave</button>
                            </div>
                            <p style="font-size: 0.78rem; color: var(--color-ink-muted); margin: 0;">
                                ⚡ Efetue a transferência ou apresente o comprovante diretamente no balcão da loja.
                            </p>
                        </div>
                    `;
                    setTimeout(() => {
                        const copyPixBtn = document.getElementById("copyPixBtn");
                        if (copyPixBtn) {
                            copyPixBtn.addEventListener("click", () => {
                                navigator.clipboard.writeText("47.892.103/0001-52").then(() => {
                                    copyPixBtn.textContent = "Copiado! ✓";
                                    showToast("Chave PIX copiada para a área de transferência!", "⚡");
                                    setTimeout(() => { copyPixBtn.textContent = "Copiar Chave"; }, 2500);
                                }).catch(() => {
                                    showToast("Chave PIX: 47.892.103/0001-52", "⚡");
                                });
                            });
                        }
                    }, 50);
                } else if (payment === "Cartão") {
                    paymentBox.innerHTML = `
                        <div class="pix-box-styled">
                            <strong style="font-size:0.88rem;">💳 Pagamento no Balcão da Loja:</strong>
                            <p style="font-size: 0.83rem; color: var(--color-ink); margin: 4px 0 0 0;">
                                O pagamento de <strong>${formatCurrency(total)}</strong> será efetuado no balcão da loja física em até 6x sem juros (ou débito) no momento da retirada.
                            </p>
                        </div>
                    `;
                } else {
                    paymentBox.innerHTML = `
                        <div class="pix-box-styled">
                            <strong style="font-size:0.88rem;">💵 Pagamento em Dinheiro:</strong>
                            <p style="font-size: 0.83rem; color: var(--color-ink); margin: 4px 0 0 0;">
                                O valor de <strong>${formatCurrency(total)}</strong> será pago em espécie no momento da retirada das peças no caixa do ateliê.
                            </p>
                        </div>
                    `;
                }
            }

            if (itemsEl) {
                itemsEl.innerHTML = cart.map(item => `
                    <div class="order-success-item-row">
                        <span><strong>${item.qty}x</strong> ${item.name} (${item.size || "M"})</span>
                        <strong>${formatCurrency(item.price * item.qty)}</strong>
                    </div>
                `).join("");
            }

            if (totalEl) {
                totalEl.innerHTML = `
                    <span>Total a Pagar:</span>
                    <strong>${formatCurrency(total)}</strong>
                `;
            }

            // Fechar modal de checkout
            closeCheckout();

            // Abrir tela de confirmação de pedido elegante
            if (orderSuccessModal && orderSuccessOverlay) {
                orderSuccessModal.classList.add("open");
                orderSuccessOverlay.classList.add("active");
                orderSuccessModal.setAttribute("aria-hidden", "false");
                document.body.style.overflow = "hidden";
                startReservationCountdown();
                launchOrderConfetti();
            }

            // Salva dados da notinha para download em PDF
            const now = new Date();
            const dateStr = now.toLocaleDateString("pt-BR");
            const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

            lastOrderDetails = {
                code: orderCode,
                date: dateStr,
                time: timeStr,
                clientName: name,
                clientPhone: phone,
                clientCpf: cpf || "Identificação no Balcão",
                paymentMethod: payment,
                hasClubDiscount: hasCpfDiscount,
                subtotalStr: formatCurrency(subtotal),
                discountVal: discount,
                discountStr: formatCurrency(discount),
                discountTitle: (hasCpfDiscount ? "Desconto Especial Cliente+ (10%):" : (appliedCoupon === "GARDENIA10" ? "Desconto Cupom (10%):" : "Desconto:")),
                totalStr: formatCurrency(total),
                items: cart.map(item => ({
                    name: item.name,
                    size: item.size || "M",
                    qty: item.qty,
                    totalStr: formatCurrency(item.price * item.qty)
                }))
            };

            // Limpa o carrinho
            cart = [];
            saveCart();
            updateCartUI();

            showToast(`Obrigada, ${name}! Seu pedido foi confirmado para retirada.`, "✨");
        });
    }

    // =========================================================================
    // 13. NEWSLETTER
    // =========================================================================
    const newsletterForm = document.getElementById("newsletterForm");
    const newsletterFeedback = document.getElementById("newsletterFeedback");
    const newsletterEmail = document.getElementById("newsletterEmail");

    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = newsletterEmail.value.trim();
            if (email) {
                if (newsletterFeedback) {
                    newsletterFeedback.innerHTML = `✓ Bem-vinda ao círculo Gardênia! Use o cupom <strong>GARDENIA10</strong> para 10% OFF.`;
                    newsletterFeedback.style.color = "#d6e2cf";
                }
                showToast("Inscrição confirmada! Seu cupom de 10% é GARDENIA10", "🎉");
                newsletterForm.reset();
            }
        });
    }

    // Tecla ESC fecha qualquer modal ou gaveta aberta
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeCart();
            closeWishlist();
            closeSearchModal();
            closeQuickView();
            closeMeasureModal();
            closeReturnsModal();
            closeCheckout();
        }
    });

    // =========================================================================
    // 13.5 CARROSSEL ROTATIVO DE AVALIAÇÕES (MOVIMENTO CONTÍNUO)
    // =========================================================================
    const reviewsTrack = document.getElementById("reviewsTrack");
    const reviewsSliderWrapper = document.getElementById("reviewsSliderWrapper");
    const reviewPlayPauseBtn = document.getElementById("reviewPlayPauseBtn");
    const reviewPrevBtn = document.getElementById("reviewPrevBtn");
    const reviewNextBtn = document.getElementById("reviewNextBtn");
    const reviewsStatusBadge = document.getElementById("reviewsStatusBadge");
    const reviewsStatusText = document.getElementById("reviewsStatusText");

    if (reviewsTrack && reviewsSliderWrapper) {
        let isManuallyPaused = false;
        const iconPause = reviewPlayPauseBtn ? reviewPlayPauseBtn.querySelector(".icon-pause") : null;
        const iconPlay = reviewPlayPauseBtn ? reviewPlayPauseBtn.querySelector(".icon-play") : null;

        function setCarouselPaused(paused, customText) {
            isManuallyPaused = paused;
            reviewsTrack.classList.toggle("is-paused", paused);
            if (reviewsStatusBadge) {
                reviewsStatusBadge.classList.toggle("is-paused", paused);
            }
            if (reviewsStatusText) {
                reviewsStatusText.textContent = customText || (paused 
                    ? "Rotação pausada • Clique no play para retomar" 
                    : "Em movimento contínuo • Passe o mouse para pausar");
            }
            if (iconPause && iconPlay) {
                iconPause.style.display = paused ? "none" : "block";
                iconPlay.style.display = paused ? "block" : "none";
            }
        }

        if (reviewPlayPauseBtn) {
            reviewPlayPauseBtn.addEventListener("click", () => {
                const willPause = !reviewsTrack.classList.contains("is-paused");
                setCarouselPaused(willPause);
            });
        }

        // Função para calcular o offset atual em px durante a animação
        function getCurrentTranslateX() {
            const style = window.getComputedStyle(reviewsTrack);
            const matrix = style.transform || style.webkitTransform;
            if (matrix && matrix !== "none") {
                const values = matrix.split("(")[1].split(")")[0].split(",");
                return parseFloat(values[4]) || 0;
            }
            return 0;
        }

        // Botões de Avançar e Voltar
        const cardStep = 398; // 370px largura + 28px gap
        
        function manualShift(direction) {
            const currentX = getCurrentTranslateX();
            const halfTrackWidth = reviewsTrack.scrollWidth / 2 || 3000;
            let targetX = currentX + (direction * cardStep);

            if (targetX > 0) {
                targetX = -halfTrackWidth + targetX;
            } else if (Math.abs(targetX) >= halfTrackWidth) {
                targetX = targetX + halfTrackWidth;
            }

            reviewsTrack.style.animation = "none";
            reviewsTrack.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
            reviewsTrack.style.transform = `translateX(${targetX}px)`;

            setCarouselPaused(true, "Navegação manual • Clique no play para retomar");

            if (reviewPlayPauseBtn) {
                const resumeHandler = () => {
                    reviewsTrack.style.transition = "";
                    reviewsTrack.style.transform = "";
                    reviewsTrack.style.animation = "";
                    setCarouselPaused(false);
                    reviewPlayPauseBtn.removeEventListener("click", resumeHandler);
                };
                reviewPlayPauseBtn.addEventListener("click", resumeHandler, { once: true });
            }
        }

        if (reviewPrevBtn) {
            reviewPrevBtn.addEventListener("click", () => manualShift(1));
        }
        if (reviewNextBtn) {
            reviewNextBtn.addEventListener("click", () => manualShift(-1));
        }

        // Touch swipe no mobile para pausar/retomar
        reviewsSliderWrapper.addEventListener("touchstart", () => {
            if (!isManuallyPaused) {
                reviewsTrack.classList.add("is-paused");
            }
        }, { passive: true });

        reviewsSliderWrapper.addEventListener("touchend", () => {
            if (!isManuallyPaused) {
                reviewsTrack.classList.remove("is-paused");
            }
        }, { passive: true });
    }

    // =========================================================================
    // 14. INICIALIZAÇÃO DE ESTADO
    // =========================================================================
    initProductGrid();
    setDepartment("Feminino");
    updateCartUI();
    updateWishlistUI();
});

