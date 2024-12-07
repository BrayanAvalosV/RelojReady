import unittest
from unittest.mock import patch, MagicMock
import pandas as pd
import os

# Importar las funciones a probar
from sync import (
    obtener_archivo_reciente,
    procesar_horarios,
    cargar_datos_asignados,
    cargar_datos_reloj
)

class TestSync(unittest.TestCase):
    
    @patch('os.listdir')
    @patch('os.path.getctime')
    def test_obtener_archivo_reciente(self, mock_getctime, mock_listdir):
        mock_listdir.return_value = ['file1.csv', 'file2.csv']
        mock_getctime.side_effect = [1, 2]  # file2 es el más reciente

        result = obtener_archivo_reciente('uploads/horario1', '.csv')
        
        self.assertEqual(result, 'uploads/horario1/file2.csv')
    
    @patch('pandas.read_csv')
    def test_procesar_horarios(self, mock_read_csv):
        data = {
            0: [1, 2],
            1: ['123', '456'],
            14: ['LUNES', 'MIERCOLES'],
            15: ['08:00', '09:00'],
            16: ['17:00', '18:00'],
            19: ['MARTES', 'JUEVES'],
            20: ['09:00', '10:00'],
            21: ['18:00', '19:00']
        }
        df = pd.DataFrame(data)

        resultado = procesar_horarios(df)
        
        self.assertEqual(len(resultado), 4)
        self.assertIn('Día', resultado.columns)

    @patch('pandas.read_csv')
    @patch('pandas.merge')
    def test_cargar_datos_asignados(self, mock_merge, mock_read_csv):
        df_resultado = pd.DataFrame({'Código Horario': [123]})
        mock_read_csv.return_value = pd.DataFrame({'CODIGO HORARIO': [123]})

        df_cruzado = cargar_datos_asignados(df_resultado, 'archivo_asignado.csv')
        
        self.assertTrue(mock_merge.called)
        self.assertEqual(df_cruzado.shape[1], 2)  # Verificar que se hayan cruzado correctamente las columnas

    @patch('pandas.read_csv')
    @patch('pandas.merge')
    def test_cargar_datos_reloj(self, mock_merge, mock_read_csv):
        df_cruzado = pd.DataFrame({'RUT': [1]})
        mock_read_csv.return_value = pd.DataFrame({
            0: [1],
            2: ['Nombre'],
            3: ['Apellido'],
            5: [10],
            6: [30],
            7: [1],
            8: [2],
            9: [2024]
        })

        df_final = cargar_datos_reloj(df_cruzado, 'archivo_reloj.log')
        
        self.assertTrue(mock_merge.called)
        self.assertIn('fecha', df_final.columns)

if __name__ == '__main__':
    unittest.main()
