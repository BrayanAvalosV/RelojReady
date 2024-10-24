import unittest
import pandas as pd
from Backend.files.sync import procesar_horarios, cargar_datos_asignados, cargar_datos_reloj


class TestSync(unittest.TestCase):

    def test_procesar_horarios(self):
        # Crear un DataFrame de ejemplo
        data = [
            [1, '123', '', '', '', '', '', '', '', '', '', '', '', '', 'LUNES', '08:00', '17:00'],
            [2, '123', '', '', '', '', '', '', '', '', '', '', '', '', 'MARTES', '09:00', '18:00']
        ]
        df = pd.DataFrame(data)
        resultado = procesar_horarios(df)

        # Verificar que el resultado contiene los datos correctos
        self.assertEqual(len(resultado), 2)  # Debe haber dos filas
        self.assertEqual(resultado.iloc[0]['Día'], 'LUNES')
        self.assertEqual(resultado.iloc[1]['Hora Entrada'], '09:00')

    def test_cargar_datos_asignados(self):
        # Crear un DataFrame de ejemplo para los horarios
        df_resultado = pd.DataFrame({
            'Día': ['LUNES', 'MARTES'],
            'Hora Entrada': ['08:00', '09:00'],
            'Hora Salida': ['17:00', '18:00'],
            'Código Horario': [123, 123]
        })

        # Crear un archivo de prueba para los datos asignados
        df_asignado = pd.DataFrame({
            'CODIGO HORARIO': [123],
            'RUT': ['1-9'],
            'Nombre': ['Juan Pérez']
        })

        # Simular el cruce de datos
        df_cruzado = cargar_datos_asignados(df_resultado, df_asignado)

        # Verificar que el cruce de datos es correcto
        self.assertEqual(len(df_cruzado), 2)  # Deben cruzarse 2 filas
        self.assertEqual(df_cruzado.iloc[0]['Nombre'], 'Juan Pérez')

    def test_cargar_datos_reloj(self):
        # Crear un DataFrame cruzado de prueba
        df_cruzado = pd.DataFrame({
            'Día': ['LUNES', 'MARTES'],
            'Hora Entrada': ['08:00', '09:00'],
            'Hora Salida': ['17:00', '18:00'],
            'Código Horario': [123, 123],
            'RUT': ['1-9', '2-7']
        })

        # Crear un archivo de prueba para los datos del reloj
        df_reloj = pd.DataFrame({
            3: ['1-9', '2-7'],  # Columna con el RUT
            4: ['08:05', '09:10'],  # Hora de entrada reloj
            5: ['17:00', '18:00']   # Hora de salida reloj
        })

        # Simular el cruce de datos con reloj
        df_final = cargar_datos_reloj(df_cruzado, df_reloj)

        # Verificar que el cruce de datos es correcto
        self.assertEqual(len(df_final), 2)  # Deben cruzarse 2 filas
        self.assertEqual(df_final.iloc[0][4], '08:05')  # Verificar hora reloj
        self.assertEqual(df_final.iloc[1][5], '18:00')  # Verificar hora reloj

if __name__ == '__main__':
    unittest.main()
