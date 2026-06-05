PROMPT #1
- A partir de este pen https://codepen.io/JuanFuentes/pen/xNwbbW
- Analiza el código para generar una nueva versión del mismo, pero en ES6, utilizando clases y módulos.
- Actualiza el código para poder obtener un resultado similar, pero en lugar de usar evento de mousemove y tiempo, añade parámetros de configuración y controles para manipular el resultado final de la animación.
- Define valores paramétricos de tiempo y distancia para controlar la animación de deformación del texto.
- Además, agrega comentarios explicativos en el código para facilitar su comprensión.
- Añade lil.gui para controlar los parámetros del resultado final.

ITERACIÓN #1
- Elimina la simulación de renderizado por frame y línea de tiempo y simplifica a un sólo script que renderize el resultado final de texto en 'wrap' con la configuración de valores iniciales o reset mediante valores de lil.gui

ITERACIÓN #2
- Traduce todo el código a p5.js
- Añade un parámetro para poder controlar la separación de línea por línea de renderizado y poder así controlar el alto del resultado.

ITERACIÓN #3
- Añade otro valor de configuración, quiero que el valor entre líneas pueda definir una mayor separación para simular el movimiento en 'y' inicial del usuario.

ITERACIÓN #4
- El valor que añadiste para simular movimiento en 'y' debe de dejar un rastro de imagen interpolado entre el antiguo y nuevo valor, no dejar un hueco, la intención es simular un escáner
