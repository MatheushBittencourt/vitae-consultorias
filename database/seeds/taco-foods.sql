-- ===============================
-- SEED: Dados da Tabela TACO (Tabela Brasileira de Composição de Alimentos)
-- Fonte: NEPA/UNICAMP
-- ===============================

-- NOTA: Valores por 100g do alimento
-- Colunas: consultancy_id, name, category, serving_size, portion_description, calories, protein, carbs, fat, fiber, sugar, saturated_fat, cholesterol, calcium, iron, potassium, vitamin_a, vitamin_c, glycemic_index, has_gluten, has_lactose, is_vegan, is_vegetarian, food_group, taco_id

-- ===============================
-- CEREAIS E DERIVADOS
-- ===============================
INSERT INTO food_library (consultancy_id, name, category, serving_size, portion_description, calories, protein, carbs, fat, fiber, sugar, saturated_fat, cholesterol, calcium, iron, potassium, glycemic_index, has_gluten, has_lactose, is_vegan, is_vegetarian, food_group, taco_id, is_global) VALUES
(NULL, 'Arroz integral cozido', 'cereais', '100g', '4 colheres de sopa', 124, 2.6, 25.8, 1.0, 2.7, 0.3, 0.2, 0, 5, 0.3, 43, 50, FALSE, FALSE, TRUE, TRUE, 'cereais', 1, TRUE),
(NULL, 'Arroz branco cozido', 'cereais', '100g', '4 colheres de sopa', 128, 2.5, 28.1, 0.2, 1.6, 0.1, 0.1, 0, 4, 0.1, 26, 73, FALSE, FALSE, TRUE, TRUE, 'cereais', 2, TRUE),
(NULL, 'Arroz parboilizado cozido', 'cereais', '100g', '4 colheres de sopa', 123, 2.8, 26.5, 0.2, 1.2, 0.1, 0.1, 0, 15, 0.3, 29, 68, FALSE, FALSE, TRUE, TRUE, 'cereais', 3, TRUE),
(NULL, 'Aveia em flocos', 'cereais', '100g', '10 colheres de sopa', 394, 14.0, 66.6, 8.5, 9.1, 0.9, 1.5, 0, 48, 4.4, 336, 55, TRUE, FALSE, TRUE, TRUE, 'cereais', 4, TRUE),
(NULL, 'Farinha de aveia', 'cereais', '100g', '10 colheres de sopa', 404, 14.0, 66.6, 10.0, 9.7, 0.9, 1.5, 0, 48, 4.4, 336, 55, TRUE, FALSE, TRUE, TRUE, 'cereais', 5, TRUE),
(NULL, 'Farinha de mandioca crua', 'cereais', '100g', '5 colheres de sopa', 361, 1.6, 87.9, 0.3, 6.4, 0.3, 0.1, 0, 40, 1.1, 257, 70, FALSE, FALSE, TRUE, TRUE, 'cereais', 6, TRUE),
(NULL, 'Farinha de milho', 'cereais', '100g', '5 colheres de sopa', 351, 7.2, 79.1, 1.5, 5.5, 0.5, 0.2, 0, 3, 1.0, 142, 70, FALSE, FALSE, TRUE, TRUE, 'cereais', 7, TRUE),
(NULL, 'Farinha de rosca', 'cereais', '100g', '5 colheres de sopa', 371, 11.0, 74.0, 3.1, 3.6, 2.8, 0.5, 0, 38, 2.7, 149, 80, TRUE, FALSE, TRUE, TRUE, 'cereais', 8, TRUE),
(NULL, 'Farinha de trigo', 'cereais', '100g', '5 colheres de sopa', 360, 9.8, 75.1, 1.4, 2.3, 0.5, 0.2, 0, 18, 1.0, 119, 85, TRUE, FALSE, TRUE, TRUE, 'cereais', 9, TRUE),
(NULL, 'Macarrão cozido', 'cereais', '100g', '1 prato raso', 102, 3.4, 19.9, 0.5, 1.2, 0.2, 0.1, 0, 7, 0.4, 24, 55, TRUE, FALSE, TRUE, TRUE, 'cereais', 10, TRUE),
(NULL, 'Macarrão integral cozido', 'cereais', '100g', '1 prato raso', 111, 4.5, 21.6, 0.9, 2.3, 0.3, 0.1, 0, 8, 0.7, 52, 42, TRUE, FALSE, TRUE, TRUE, 'cereais', 11, TRUE),
(NULL, 'Milho verde cozido', 'cereais', '100g', '1 espiga média', 96, 3.2, 18.4, 1.3, 2.6, 3.2, 0.2, 0, 2, 0.5, 218, 60, FALSE, FALSE, TRUE, TRUE, 'cereais', 12, TRUE),
(NULL, 'Pão francês', 'cereais', '100g', '2 unidades', 300, 8.0, 58.6, 3.1, 2.3, 2.8, 0.9, 0, 23, 0.9, 118, 95, TRUE, FALSE, TRUE, TRUE, 'cereais', 13, TRUE),
(NULL, 'Pão integral', 'cereais', '100g', '4 fatias', 253, 9.4, 49.9, 2.9, 6.9, 4.1, 0.6, 0, 44, 2.4, 220, 65, TRUE, FALSE, TRUE, TRUE, 'cereais', 14, TRUE),
(NULL, 'Pão de forma', 'cereais', '100g', '4 fatias', 271, 9.4, 50.7, 3.7, 2.8, 4.1, 0.8, 0, 117, 1.6, 166, 75, TRUE, FALSE, TRUE, TRUE, 'cereais', 15, TRUE),
(NULL, 'Quinoa cozida', 'cereais', '100g', '4 colheres de sopa', 120, 4.4, 21.3, 1.9, 2.8, 0.9, 0.2, 0, 17, 1.5, 172, 53, FALSE, FALSE, TRUE, TRUE, 'cereais', 16, TRUE),

-- ===============================
-- LEGUMINOSAS
-- ===============================
(NULL, 'Feijão carioca cozido', 'leguminosas', '100g', '1 concha média', 76, 4.8, 13.6, 0.5, 8.5, 0.3, 0.1, 0, 27, 1.3, 256, 30, FALSE, FALSE, TRUE, TRUE, 'leguminosas', 101, TRUE),
(NULL, 'Feijão preto cozido', 'leguminosas', '100g', '1 concha média', 77, 4.5, 14.0, 0.5, 8.4, 0.3, 0.1, 0, 29, 1.5, 355, 30, FALSE, FALSE, TRUE, TRUE, 'leguminosas', 102, TRUE),
(NULL, 'Feijão branco cozido', 'leguminosas', '100g', '1 concha média', 102, 6.6, 17.6, 0.5, 6.3, 0.6, 0.1, 0, 62, 2.5, 307, 31, FALSE, FALSE, TRUE, TRUE, 'leguminosas', 103, TRUE),
(NULL, 'Grão-de-bico cozido', 'leguminosas', '100g', '4 colheres de sopa', 164, 8.9, 27.4, 2.6, 7.6, 4.8, 0.3, 0, 49, 2.9, 291, 33, FALSE, FALSE, TRUE, TRUE, 'leguminosas', 104, TRUE),
(NULL, 'Lentilha cozida', 'leguminosas', '100g', '4 colheres de sopa', 116, 9.0, 20.1, 0.4, 7.9, 1.8, 0.1, 0, 19, 3.3, 369, 30, FALSE, FALSE, TRUE, TRUE, 'leguminosas', 105, TRUE),
(NULL, 'Ervilha cozida', 'leguminosas', '100g', '4 colheres de sopa', 81, 5.4, 14.5, 0.4, 5.1, 5.7, 0.1, 0, 25, 1.5, 244, 48, FALSE, FALSE, TRUE, TRUE, 'leguminosas', 106, TRUE),
(NULL, 'Soja cozida', 'leguminosas', '100g', '4 colheres de sopa', 173, 16.6, 9.9, 9.0, 6.0, 3.0, 1.3, 0, 102, 5.1, 515, 16, FALSE, FALSE, TRUE, TRUE, 'leguminosas', 107, TRUE),

-- ===============================
-- VERDURAS E LEGUMES
-- ===============================
(NULL, 'Abóbora cozida', 'verduras', '100g', '4 colheres de sopa', 28, 0.8, 6.5, 0.1, 1.7, 2.8, 0.0, 0, 15, 0.3, 222, 75, FALSE, FALSE, TRUE, TRUE, 'vegetais', 201, TRUE),
(NULL, 'Abobrinha cozida', 'verduras', '100g', '4 colheres de sopa', 15, 0.6, 3.3, 0.1, 1.3, 1.5, 0.0, 0, 15, 0.3, 261, 15, FALSE, FALSE, TRUE, TRUE, 'vegetais', 202, TRUE),
(NULL, 'Agrião cru', 'verduras', '100g', '1 prato cheio', 17, 2.7, 2.3, 0.2, 2.1, 0.2, 0.0, 0, 133, 2.6, 316, 15, FALSE, FALSE, TRUE, TRUE, 'vegetais', 203, TRUE),
(NULL, 'Alface crespa crua', 'verduras', '100g', '1 prato cheio', 11, 1.3, 1.7, 0.2, 1.8, 0.5, 0.0, 0, 38, 0.4, 267, 10, FALSE, FALSE, TRUE, TRUE, 'vegetais', 204, TRUE),
(NULL, 'Alho cru', 'verduras', '100g', '20 dentes', 113, 7.0, 23.9, 0.2, 4.3, 1.0, 0.0, 0, 14, 0.8, 535, 30, FALSE, FALSE, TRUE, TRUE, 'vegetais', 205, TRUE),
(NULL, 'Batata inglesa cozida', 'verduras', '100g', '1 unidade média', 52, 1.2, 11.9, 0.1, 1.3, 0.8, 0.0, 0, 4, 0.2, 238, 78, FALSE, FALSE, TRUE, TRUE, 'tubérculos', 206, TRUE),
(NULL, 'Batata doce cozida', 'verduras', '100g', '1 unidade média', 77, 0.6, 18.4, 0.1, 2.2, 5.7, 0.0, 0, 17, 0.3, 203, 63, FALSE, FALSE, TRUE, TRUE, 'tubérculos', 207, TRUE),
(NULL, 'Berinjela cozida', 'verduras', '100g', '4 colheres de sopa', 19, 0.6, 4.5, 0.1, 2.5, 2.4, 0.0, 0, 8, 0.2, 123, 20, FALSE, FALSE, TRUE, TRUE, 'vegetais', 208, TRUE),
(NULL, 'Beterraba cozida', 'verduras', '100g', '4 colheres de sopa', 32, 1.2, 7.2, 0.1, 1.9, 5.5, 0.0, 0, 11, 0.5, 232, 65, FALSE, FALSE, TRUE, TRUE, 'vegetais', 209, TRUE),
(NULL, 'Brócolis cozido', 'verduras', '100g', '4 colheres de sopa', 25, 2.1, 4.4, 0.3, 3.4, 1.4, 0.0, 0, 51, 0.5, 256, 10, FALSE, FALSE, TRUE, TRUE, 'vegetais', 210, TRUE),
(NULL, 'Cenoura crua', 'verduras', '100g', '1 unidade média', 34, 1.3, 7.7, 0.2, 3.2, 3.2, 0.0, 0, 23, 0.2, 315, 47, FALSE, FALSE, TRUE, TRUE, 'vegetais', 211, TRUE),
(NULL, 'Cebola crua', 'verduras', '100g', '1 unidade média', 39, 1.7, 8.9, 0.1, 2.2, 5.0, 0.0, 0, 15, 0.2, 176, 10, FALSE, FALSE, TRUE, TRUE, 'vegetais', 212, TRUE),
(NULL, 'Couve-flor cozida', 'verduras', '100g', '4 colheres de sopa', 19, 1.4, 3.9, 0.2, 2.4, 1.4, 0.0, 0, 16, 0.2, 142, 15, FALSE, FALSE, TRUE, TRUE, 'vegetais', 213, TRUE),
(NULL, 'Couve manteiga refogada', 'verduras', '100g', '4 colheres de sopa', 90, 2.9, 8.0, 5.7, 4.0, 0.8, 0.8, 0, 177, 0.5, 203, 10, FALSE, FALSE, TRUE, TRUE, 'vegetais', 214, TRUE),
(NULL, 'Espinafre refogado', 'verduras', '100g', '4 colheres de sopa', 57, 2.6, 3.8, 4.0, 2.5, 0.4, 0.6, 0, 160, 1.3, 324, 15, FALSE, FALSE, TRUE, TRUE, 'vegetais', 215, TRUE),
(NULL, 'Mandioca cozida', 'verduras', '100g', '2 pedaços médios', 125, 0.6, 30.1, 0.3, 1.6, 1.4, 0.1, 0, 11, 0.2, 205, 55, FALSE, FALSE, TRUE, TRUE, 'tubérculos', 216, TRUE),
(NULL, 'Pepino cru', 'verduras', '100g', '1/2 unidade', 10, 0.9, 2.0, 0.1, 1.1, 1.4, 0.0, 0, 8, 0.2, 140, 15, FALSE, FALSE, TRUE, TRUE, 'vegetais', 217, TRUE),
(NULL, 'Pimentão verde cru', 'verduras', '100g', '1 unidade média', 21, 1.1, 4.9, 0.1, 2.6, 2.4, 0.0, 0, 8, 0.4, 183, 15, FALSE, FALSE, TRUE, TRUE, 'vegetais', 218, TRUE),
(NULL, 'Repolho cru', 'verduras', '100g', '3 folhas médias', 17, 0.9, 3.9, 0.1, 1.9, 2.5, 0.0, 0, 35, 0.3, 150, 10, FALSE, FALSE, TRUE, TRUE, 'vegetais', 219, TRUE),
(NULL, 'Tomate cru', 'verduras', '100g', '1 unidade média', 15, 1.1, 3.1, 0.2, 1.2, 2.6, 0.0, 0, 7, 0.2, 222, 30, FALSE, FALSE, TRUE, TRUE, 'vegetais', 220, TRUE),

-- ===============================
-- FRUTAS
-- ===============================
(NULL, 'Abacate', 'frutas', '100g', '4 colheres de sopa', 96, 1.2, 6.0, 8.4, 6.3, 0.3, 1.1, 0, 8, 0.3, 206, 10, FALSE, FALSE, TRUE, TRUE, 'frutas', 301, TRUE),
(NULL, 'Abacaxi', 'frutas', '100g', '1 fatia grossa', 48, 0.9, 12.3, 0.1, 1.0, 9.3, 0.0, 0, 22, 0.3, 131, 66, FALSE, FALSE, TRUE, TRUE, 'frutas', 302, TRUE),
(NULL, 'Açaí polpa', 'frutas', '100g', '1 porção', 58, 0.8, 6.2, 3.9, 2.6, 0.9, 0.8, 0, 35, 0.5, 124, 10, FALSE, FALSE, TRUE, TRUE, 'frutas', 303, TRUE),
(NULL, 'Banana prata', 'frutas', '100g', '1 unidade média', 98, 1.3, 26.0, 0.1, 2.0, 15.9, 0.0, 0, 8, 0.4, 376, 55, FALSE, FALSE, TRUE, TRUE, 'frutas', 304, TRUE),
(NULL, 'Banana nanica', 'frutas', '100g', '1 unidade média', 92, 1.4, 23.8, 0.1, 1.9, 15.4, 0.0, 0, 3, 0.3, 376, 51, FALSE, FALSE, TRUE, TRUE, 'frutas', 305, TRUE),
(NULL, 'Caqui', 'frutas', '100g', '1 unidade média', 71, 0.4, 19.3, 0.1, 6.5, 16.5, 0.0, 0, 18, 0.2, 164, 50, FALSE, FALSE, TRUE, TRUE, 'frutas', 306, TRUE),
(NULL, 'Goiaba vermelha', 'frutas', '100g', '1 unidade média', 54, 1.1, 13.0, 0.4, 6.2, 8.9, 0.1, 0, 4, 0.2, 198, 38, FALSE, FALSE, TRUE, TRUE, 'frutas', 307, TRUE),
(NULL, 'Kiwi', 'frutas', '100g', '1 unidade grande', 51, 0.9, 11.5, 0.6, 2.7, 6.2, 0.0, 0, 24, 0.3, 269, 50, FALSE, FALSE, TRUE, TRUE, 'frutas', 308, TRUE),
(NULL, 'Laranja pera', 'frutas', '100g', '1 unidade média', 37, 1.0, 8.9, 0.1, 0.8, 8.6, 0.0, 0, 22, 0.1, 163, 42, FALSE, FALSE, TRUE, TRUE, 'frutas', 309, TRUE),
(NULL, 'Limão', 'frutas', '100g', '4 unidades pequenas', 32, 0.9, 11.1, 0.1, 0.0, 2.5, 0.0, 0, 51, 0.2, 128, 20, FALSE, FALSE, TRUE, TRUE, 'frutas', 310, TRUE),
(NULL, 'Maçã fuji', 'frutas', '100g', '1 unidade pequena', 56, 0.3, 15.2, 0.0, 1.3, 10.4, 0.0, 0, 2, 0.1, 75, 38, FALSE, FALSE, TRUE, TRUE, 'frutas', 311, TRUE),
(NULL, 'Mamão papaya', 'frutas', '100g', '1 fatia média', 45, 0.5, 11.6, 0.1, 1.0, 9.1, 0.0, 0, 25, 0.2, 222, 60, FALSE, FALSE, TRUE, TRUE, 'frutas', 312, TRUE),
(NULL, 'Manga tommy', 'frutas', '100g', '1/2 unidade', 51, 0.4, 12.8, 0.2, 1.6, 11.7, 0.0, 0, 8, 0.2, 148, 55, FALSE, FALSE, TRUE, TRUE, 'frutas', 313, TRUE),
(NULL, 'Maracujá polpa', 'frutas', '100g', '6 colheres de sopa', 68, 2.0, 12.3, 2.1, 1.1, 10.0, 0.3, 0, 5, 0.6, 338, 30, FALSE, FALSE, TRUE, TRUE, 'frutas', 314, TRUE),
(NULL, 'Melancia', 'frutas', '100g', '1 fatia média', 33, 0.9, 8.1, 0.0, 0.1, 6.2, 0.0, 0, 8, 0.2, 104, 72, FALSE, FALSE, TRUE, TRUE, 'frutas', 315, TRUE),
(NULL, 'Melão', 'frutas', '100g', '1 fatia média', 29, 0.7, 7.5, 0.0, 0.3, 7.2, 0.0, 0, 3, 0.2, 216, 65, FALSE, FALSE, TRUE, TRUE, 'frutas', 316, TRUE),
(NULL, 'Morango', 'frutas', '100g', '10 unidades médias', 30, 0.9, 6.8, 0.3, 1.7, 4.1, 0.0, 0, 11, 0.3, 184, 40, FALSE, FALSE, TRUE, TRUE, 'frutas', 317, TRUE),
(NULL, 'Pera', 'frutas', '100g', '1 unidade média', 53, 0.6, 14.0, 0.1, 3.0, 9.1, 0.0, 0, 9, 0.1, 116, 38, FALSE, FALSE, TRUE, TRUE, 'frutas', 318, TRUE),
(NULL, 'Uva itália', 'frutas', '100g', '12 bagos', 53, 0.7, 13.6, 0.2, 0.9, 14.9, 0.0, 0, 7, 0.2, 162, 59, FALSE, FALSE, TRUE, TRUE, 'frutas', 319, TRUE),

-- ===============================
-- CARNES E OVOS
-- ===============================
(NULL, 'Frango peito sem pele grelhado', 'carnes', '100g', '1 filé médio', 159, 32.0, 0.0, 3.2, 0.0, 0.0, 0.9, 82, 4, 0.4, 340, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 401, TRUE),
(NULL, 'Frango coxa sem pele cozida', 'carnes', '100g', '1 unidade', 163, 27.3, 0.0, 5.8, 0.0, 0.0, 1.6, 116, 12, 1.0, 236, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 402, TRUE),
(NULL, 'Carne bovina patinho grelhado', 'carnes', '100g', '1 bife médio', 219, 35.9, 0.0, 7.3, 0.0, 0.0, 2.8, 83, 3, 3.4, 386, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 403, TRUE),
(NULL, 'Carne bovina acém cozido', 'carnes', '100g', '4 pedaços médios', 215, 26.7, 0.0, 11.1, 0.0, 0.0, 4.4, 72, 3, 2.8, 208, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 404, TRUE),
(NULL, 'Carne bovina alcatra grelhada', 'carnes', '100g', '1 bife médio', 195, 32.0, 0.0, 7.1, 0.0, 0.0, 2.8, 62, 6, 3.2, 350, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 405, TRUE),
(NULL, 'Carne bovina contrafilé grelhado', 'carnes', '100g', '1 bife médio', 192, 31.5, 0.0, 6.8, 0.0, 0.0, 2.7, 60, 5, 2.7, 350, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 406, TRUE),
(NULL, 'Carne bovina coxão mole cozido', 'carnes', '100g', '4 pedaços médios', 245, 32.4, 0.0, 12.5, 0.0, 0.0, 5.0, 91, 5, 2.3, 296, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 407, TRUE),
(NULL, 'Carne bovina fígado grelhado', 'carnes', '100g', '1 bife médio', 225, 29.5, 5.6, 8.8, 0.0, 3.9, 3.0, 397, 11, 5.8, 351, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 408, TRUE),
(NULL, 'Carne bovina lagarto cozido', 'carnes', '100g', '4 pedaços médios', 197, 32.3, 0.0, 6.8, 0.0, 0.0, 2.5, 73, 5, 2.3, 306, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 409, TRUE),
(NULL, 'Carne bovina músculo cozido', 'carnes', '100g', '4 pedaços médios', 171, 28.3, 0.0, 5.9, 0.0, 0.0, 2.3, 77, 3, 2.6, 220, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 410, TRUE),
(NULL, 'Carne bovina picanha grelhada', 'carnes', '100g', '1 bife médio', 289, 25.2, 0.0, 20.5, 0.0, 0.0, 8.2, 87, 5, 2.6, 311, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 411, TRUE),
(NULL, 'Carne suína lombo assado', 'carnes', '100g', '2 fatias médias', 210, 32.0, 0.0, 8.6, 0.0, 0.0, 3.1, 65, 4, 0.8, 392, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 412, TRUE),
(NULL, 'Carne suína pernil assado', 'carnes', '100g', '2 fatias médias', 262, 27.0, 0.0, 16.6, 0.0, 0.0, 6.0, 91, 5, 0.8, 343, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 413, TRUE),
(NULL, 'Peru peito assado', 'carnes', '100g', '2 fatias médias', 153, 29.5, 0.0, 3.6, 0.0, 0.0, 1.2, 82, 4, 1.4, 341, 0, FALSE, FALSE, FALSE, FALSE, 'carnes', 414, TRUE),
(NULL, 'Ovo de galinha cozido', 'ovos', '100g', '2 unidades', 146, 13.3, 0.6, 9.5, 0.0, 0.6, 3.1, 397, 49, 1.6, 130, 0, FALSE, FALSE, FALSE, TRUE, 'ovos', 415, TRUE),
(NULL, 'Ovo de galinha frito', 'ovos', '100g', '2 unidades', 240, 15.6, 1.2, 19.3, 0.0, 1.0, 4.8, 516, 61, 2.1, 159, 0, FALSE, FALSE, FALSE, TRUE, 'ovos', 416, TRUE),
(NULL, 'Clara de ovo cozida', 'ovos', '100g', '3 claras', 44, 9.8, 0.8, 0.0, 0.0, 0.7, 0.0, 0, 6, 0.1, 146, 0, FALSE, FALSE, FALSE, TRUE, 'ovos', 417, TRUE),

-- ===============================
-- PEIXES E FRUTOS DO MAR
-- ===============================
(NULL, 'Atum fresco grelhado', 'pescados', '100g', '1 posta média', 118, 25.7, 0.0, 1.0, 0.0, 0.0, 0.2, 45, 16, 1.3, 323, 0, FALSE, FALSE, FALSE, FALSE, 'pescados', 501, TRUE),
(NULL, 'Bacalhau salgado refogado', 'pescados', '100g', '1 posta média', 138, 29.0, 0.0, 2.1, 0.0, 0.0, 0.4, 70, 51, 0.8, 503, 0, FALSE, FALSE, FALSE, FALSE, 'pescados', 502, TRUE),
(NULL, 'Camarão cozido', 'pescados', '100g', '15 unidades médias', 90, 18.4, 0.0, 1.5, 0.0, 0.0, 0.2, 189, 48, 1.7, 173, 0, FALSE, FALSE, FALSE, FALSE, 'pescados', 503, TRUE),
(NULL, 'Merluza filé cozido', 'pescados', '100g', '1 filé médio', 91, 20.0, 0.0, 0.8, 0.0, 0.0, 0.2, 56, 20, 0.3, 397, 0, FALSE, FALSE, FALSE, FALSE, 'pescados', 504, TRUE),
(NULL, 'Salmão grelhado', 'pescados', '100g', '1 posta média', 243, 26.1, 0.0, 14.9, 0.0, 0.0, 2.8, 60, 14, 0.5, 420, 0, FALSE, FALSE, FALSE, FALSE, 'pescados', 505, TRUE),
(NULL, 'Sardinha assada', 'pescados', '100g', '2 unidades médias', 164, 32.0, 0.0, 3.7, 0.0, 0.0, 0.9, 148, 550, 2.7, 472, 0, FALSE, FALSE, FALSE, FALSE, 'pescados', 506, TRUE),
(NULL, 'Tilápia grelhada', 'pescados', '100g', '1 filé médio', 95, 20.1, 0.0, 1.3, 0.0, 0.0, 0.4, 57, 14, 0.5, 380, 0, FALSE, FALSE, FALSE, FALSE, 'pescados', 507, TRUE),

-- ===============================
-- LATICÍNIOS
-- ===============================
(NULL, 'Leite integral', 'laticínios', '100ml', '1/2 copo', 61, 3.2, 4.7, 3.5, 0.0, 4.7, 2.2, 14, 123, 0.1, 140, 32, FALSE, TRUE, FALSE, TRUE, 'laticínios', 601, TRUE),
(NULL, 'Leite desnatado', 'laticínios', '100ml', '1/2 copo', 35, 3.5, 5.1, 0.1, 0.0, 5.1, 0.1, 4, 134, 0.1, 166, 32, FALSE, TRUE, FALSE, TRUE, 'laticínios', 602, TRUE),
(NULL, 'Iogurte natural', 'laticínios', '100g', '1 pote pequeno', 51, 4.1, 6.1, 1.0, 0.0, 6.0, 0.7, 5, 143, 0.1, 214, 35, FALSE, TRUE, FALSE, TRUE, 'laticínios', 603, TRUE),
(NULL, 'Iogurte desnatado', 'laticínios', '100g', '1 pote pequeno', 42, 4.6, 6.0, 0.1, 0.0, 5.9, 0.1, 2, 154, 0.1, 207, 35, FALSE, TRUE, FALSE, TRUE, 'laticínios', 604, TRUE),
(NULL, 'Queijo minas frescal', 'laticínios', '100g', '3 fatias médias', 264, 17.4, 3.2, 20.2, 0.0, 3.0, 13.2, 62, 579, 0.1, 103, 0, FALSE, TRUE, FALSE, TRUE, 'laticínios', 605, TRUE),
(NULL, 'Queijo mussarela', 'laticínios', '100g', '4 fatias médias', 330, 22.6, 3.0, 25.2, 0.0, 0.8, 16.2, 79, 731, 0.1, 70, 0, FALSE, TRUE, FALSE, TRUE, 'laticínios', 606, TRUE),
(NULL, 'Queijo prato', 'laticínios', '100g', '4 fatias médias', 358, 22.7, 0.0, 29.3, 0.0, 0.0, 18.8, 88, 746, 0.4, 93, 0, FALSE, TRUE, FALSE, TRUE, 'laticínios', 607, TRUE),
(NULL, 'Queijo cottage', 'laticínios', '100g', '4 colheres de sopa', 98, 11.1, 3.4, 4.3, 0.0, 2.7, 1.7, 17, 83, 0.1, 104, 0, FALSE, TRUE, FALSE, TRUE, 'laticínios', 608, TRUE),
(NULL, 'Requeijão cremoso', 'laticínios', '100g', '5 colheres de sopa', 257, 5.4, 4.0, 24.3, 0.0, 2.3, 14.9, 72, 107, 0.1, 78, 0, FALSE, TRUE, FALSE, TRUE, 'laticínios', 609, TRUE),
(NULL, 'Ricota', 'laticínios', '100g', '3 colheres de sopa', 140, 12.6, 5.1, 8.0, 0.0, 0.3, 5.2, 31, 253, 0.1, 105, 0, FALSE, TRUE, FALSE, TRUE, 'laticínios', 610, TRUE),

-- ===============================
-- OLEAGINOSAS E SEMENTES
-- ===============================
(NULL, 'Amendoim torrado', 'oleaginosas', '100g', '1/2 xícara', 606, 22.5, 21.4, 49.4, 7.6, 4.4, 8.3, 0, 42, 1.3, 580, 14, FALSE, FALSE, TRUE, TRUE, 'oleaginosas', 701, TRUE),
(NULL, 'Castanha de caju torrada', 'oleaginosas', '100g', '1/2 xícara', 574, 18.5, 29.1, 46.3, 3.7, 4.8, 9.2, 0, 35, 5.2, 565, 25, FALSE, FALSE, TRUE, TRUE, 'oleaginosas', 702, TRUE),
(NULL, 'Castanha-do-pará', 'oleaginosas', '100g', '8 unidades', 643, 14.5, 15.1, 63.5, 7.9, 2.3, 15.1, 0, 146, 2.4, 600, 0, FALSE, FALSE, TRUE, TRUE, 'oleaginosas', 703, TRUE),
(NULL, 'Amêndoa', 'oleaginosas', '100g', '25 unidades', 581, 18.6, 29.5, 47.3, 11.6, 3.9, 3.9, 0, 237, 4.3, 728, 0, FALSE, FALSE, TRUE, TRUE, 'oleaginosas', 704, TRUE),
(NULL, 'Noz', 'oleaginosas', '100g', '15 unidades', 620, 14.0, 18.4, 59.4, 5.2, 2.6, 5.6, 0, 105, 2.6, 500, 15, FALSE, FALSE, TRUE, TRUE, 'oleaginosas', 705, TRUE),
(NULL, 'Semente de linhaça', 'oleaginosas', '100g', '6 colheres de sopa', 495, 14.1, 43.3, 32.3, 33.5, 1.6, 3.2, 0, 211, 4.7, 869, 0, FALSE, FALSE, TRUE, TRUE, 'oleaginosas', 706, TRUE),
(NULL, 'Semente de chia', 'oleaginosas', '100g', '6 colheres de sopa', 486, 16.5, 42.1, 30.7, 34.4, 0.0, 3.3, 0, 631, 7.7, 407, 0, FALSE, FALSE, TRUE, TRUE, 'oleaginosas', 707, TRUE),
(NULL, 'Semente de girassol', 'oleaginosas', '100g', '1/2 xícara', 570, 22.8, 18.8, 49.6, 11.1, 2.6, 5.2, 0, 70, 3.8, 850, 35, FALSE, FALSE, TRUE, TRUE, 'oleaginosas', 708, TRUE),

-- ===============================
-- ÓLEOS E GORDURAS
-- ===============================
(NULL, 'Azeite de oliva extra virgem', 'óleos', '100ml', '6 colheres de sopa', 884, 0.0, 0.0, 100.0, 0.0, 0.0, 14.0, 0, 0, 0.4, 0, 0, FALSE, FALSE, TRUE, TRUE, 'gorduras', 801, TRUE),
(NULL, 'Óleo de coco', 'óleos', '100ml', '6 colheres de sopa', 862, 0.0, 0.0, 100.0, 0.0, 0.0, 82.5, 0, 0, 0.0, 0, 0, FALSE, FALSE, TRUE, TRUE, 'gorduras', 802, TRUE),
(NULL, 'Óleo de soja', 'óleos', '100ml', '6 colheres de sopa', 884, 0.0, 0.0, 100.0, 0.0, 0.0, 14.4, 0, 0, 0.0, 0, 0, FALSE, FALSE, TRUE, TRUE, 'gorduras', 803, TRUE),
(NULL, 'Manteiga com sal', 'óleos', '100g', '6 colheres de sopa', 726, 0.4, 0.0, 82.4, 0.0, 0.1, 51.4, 214, 15, 0.0, 26, 0, FALSE, TRUE, FALSE, TRUE, 'gorduras', 804, TRUE),

-- ===============================
-- AÇÚCARES E DOCES
-- ===============================
(NULL, 'Açúcar refinado', 'açúcares', '100g', '5 colheres de sopa', 387, 0.0, 99.5, 0.0, 0.0, 99.5, 0.0, 0, 1, 0.1, 2, 65, FALSE, FALSE, TRUE, TRUE, 'açúcares', 901, TRUE),
(NULL, 'Açúcar mascavo', 'açúcares', '100g', '5 colheres de sopa', 369, 0.7, 94.5, 0.1, 0.0, 93.7, 0.0, 0, 127, 8.3, 522, 65, FALSE, FALSE, TRUE, TRUE, 'açúcares', 902, TRUE),
(NULL, 'Mel', 'açúcares', '100g', '5 colheres de sopa', 309, 0.4, 84.0, 0.0, 0.0, 82.1, 0.0, 0, 5, 0.3, 51, 55, FALSE, FALSE, TRUE, TRUE, 'açúcares', 903, TRUE),
(NULL, 'Chocolate ao leite', 'doces', '100g', '1 barra média', 550, 7.6, 59.0, 31.8, 3.4, 52.0, 19.1, 28, 216, 0.8, 372, 49, TRUE, TRUE, FALSE, TRUE, 'doces', 904, TRUE),
(NULL, 'Chocolate amargo 70%', 'doces', '100g', '1 barra média', 598, 7.8, 45.9, 42.6, 10.9, 24.0, 24.5, 0, 73, 11.9, 715, 23, TRUE, FALSE, TRUE, TRUE, 'doces', 905, TRUE),

-- ===============================
-- BEBIDAS
-- ===============================
(NULL, 'Café coado sem açúcar', 'bebidas', '100ml', '1 xícara pequena', 9, 0.2, 0.4, 0.0, 0.0, 0.0, 0.0, 0, 2, 0.1, 49, 0, FALSE, FALSE, TRUE, TRUE, 'bebidas', 1001, TRUE),
(NULL, 'Chá preto sem açúcar', 'bebidas', '100ml', '1 xícara', 1, 0.0, 0.2, 0.0, 0.0, 0.0, 0.0, 0, 0, 0.0, 37, 0, FALSE, FALSE, TRUE, TRUE, 'bebidas', 1002, TRUE),
(NULL, 'Água de coco', 'bebidas', '100ml', '1/2 copo', 22, 0.0, 5.3, 0.0, 0.0, 5.0, 0.0, 0, 25, 0.3, 162, 35, FALSE, FALSE, TRUE, TRUE, 'bebidas', 1003, TRUE),
(NULL, 'Suco de laranja natural', 'bebidas', '100ml', '1/2 copo', 45, 0.8, 10.4, 0.2, 0.1, 8.9, 0.0, 0, 9, 0.2, 154, 50, FALSE, FALSE, TRUE, TRUE, 'bebidas', 1004, TRUE),
(NULL, 'Suco de uva integral', 'bebidas', '100ml', '1/2 copo', 57, 0.5, 14.0, 0.1, 0.1, 13.9, 0.0, 0, 9, 0.3, 106, 48, FALSE, FALSE, TRUE, TRUE, 'bebidas', 1005, TRUE);

-- ===============================
-- FIM DO SEED TACO
-- ===============================
