import pandas as pd
import os

# Definir las rutas donde se almacenan los archivos
UPLOAD_FOLDER_RELOJ = 'uploads/reloj'
UPLOAD_FOLDER_HORARIO1 = 'uploads/horario1'
UPLOAD_FOLDER_HORARIO2 = 'uploads/horario2'

# Obtener el archivo más reciente de cada carpeta
def obtener_archivo_reciente(carpeta, extension):
    archivos = [f for f in os.listdir(carpeta) if f.endswith(extension)]
    
    if not archivos:
        print(f"No se encontraron archivos con la extensión {extension} en la carpeta {carpeta}.")
        return None

    print(f"Archivos encontrados en la carpeta {carpeta}: {archivos}")
    archivo_mas_reciente = max(archivos, key=lambda f: os.path.getctime(os.path.join(carpeta, f)))
    print(f"El archivo más reciente es: {archivo_mas_reciente}")
    
    return os.path.join(carpeta, archivo_mas_reciente)


def procesar_horarios(df):
    dias_semana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO']
    #dias_semana = ['LUNES']
    dataframes_dias = []
    codigo_horario_actual = None

    # Filtrar los horarios para cada día de la semana y almacenarlos en la lista
    for index, row in df.iterrows():
        # Verificar si la columna 1 contiene un número (código de horario)
        if isinstance(row[1], str) and row[1].isdigit():  # Verificar si es un número
            codigo_horario_actual = int(row[1])  # Actualizar el código de horario actual
        
        # Verificar si el día de la semana está presente en la fila
        for dia in dias_semana:
            # Para LUNES (columna 14)
            if len(row) > 14 and row[14] == dia:
                horarios = [row[14], row[15], row[16], codigo_horario_actual]
                dataframes_dias.append(horarios)
            # Para MARTES, MIÉRCOLES, JUEVES, VIERNES (columna 19)
            elif len(row) > 19 and row[19] == dia:
                horarios = [row[19], row[20], row[21], codigo_horario_actual]
                dataframes_dias.append(horarios)

    # Crear un DataFrame a partir de la lista de horarios
    resultado = pd.DataFrame(dataframes_dias, columns=['Día', 'Hora Entrada', 'Hora Salida', 'Código Horario'])
    return resultado

def cargar_datos_asignados(df_resultado, archivo_asignado):
    df_asignado = pd.read_csv(archivo_asignado, sep=',', encoding='utf-8')
    # Asegurarse de que 'CODIGO HORARIO' sea string para evitar problemas en el merge
    df_resultado['Código Horario'] = df_resultado['Código Horario'].astype(str)
    df_asignado['CODIGO HORARIO'] = df_asignado['CODIGO HORARIO'].astype(str)
    
    # Cruzar los datos entre el archivo de horarios y el asignado
    df_cruzado = pd.merge(df_resultado, df_asignado, left_on='Código Horario', right_on='CODIGO HORARIO', how='right')
    return df_cruzado

def cargar_datos_reloj(df_cruzado, archivo_reloj):
    df_reloj = pd.read_csv(archivo_reloj, header=None, sep=',', dtype={5: str, 6: str}, encoding='utf-8')
    # Eliminar las columnas que no son necesarias
    df_reloj['hora_reloj'] = df_reloj.apply(lambda row: f"{row[5]}:{row[6]}", axis=1)
    # Transformar las columnas de fecha
    df_reloj['fecha_reloj'] = df_reloj.apply(lambda row: f"{row[8]:02}/{row[7]:02}/{row[9]:02}", axis=1)
    df_reloj = df_reloj.loc[:, [2,3,'hora_reloj','fecha_reloj']]

    dias_mapeo = {
    "Monday": "LUNES",
    "Tuesday": "MARTES",
    "Wednesday": "MIERCOLES",
    "Thursday": "JUEVES",
    "Friday": "VIERNES",
    "Saturday": "SABADO",
    "Sunday": "DOMINGO"
    }

    # Convertir fecha_reloj a día de la semana
    df_reloj['dia_semana'] = pd.to_datetime(df_reloj['fecha_reloj'], format='%d/%m/%y').dt.strftime('%A').map(dias_mapeo)
    df_reloj = df_reloj.loc[:, [2, 3, 'hora_reloj', 'fecha_reloj', 'dia_semana']]

    # Asegurarse de que 'RUT' en df_cruzado y la columna de RUT en df_reloj sean strings
    df_cruzado['RUT'] = df_cruzado['RUT'].astype(str)
    df_reloj[3] = df_reloj[3].astype(str)

    # Cruzar los datos entre el archivo cruzado y el reloj
    df_final = pd.merge(df_cruzado, df_reloj, left_on=['RUT', 'Día'], right_on=[3,'dia_semana'], how='right')
    df_final = df_final.drop(columns=['Código Horario','DV',3,'HORARIO ASIGNADO'])
    df_final = df_final.rename(columns={2: 'entrada/salida'})

    return df_final

def obtener_df():
    # Cargar el archivo de horarios más reciente
    archivo_horarios = obtener_archivo_reciente(UPLOAD_FOLDER_HORARIO1, '.csv')
    if archivo_horarios:
        df_horarios = pd.read_csv(archivo_horarios, sep=';', header=None, encoding='utf-8')
        # Procesar horarios
        resultado_horarios = procesar_horarios(df_horarios)

        # Cargar y cruzar el archivo asignado
        archivo_asignado = obtener_archivo_reciente(UPLOAD_FOLDER_HORARIO2, '.csv')
        if archivo_asignado:
            df_cruzado = cargar_datos_asignados(resultado_horarios, archivo_asignado)

            # Cargar y cruzar el archivo reloj
            archivo_reloj = obtener_archivo_reciente(UPLOAD_FOLDER_RELOJ, '.log')  # Cambiado a .log
            if archivo_reloj:
                df_final = cargar_datos_reloj(df_cruzado, archivo_reloj)

                # Mostrar resultado final
                return df_final
                #print(df_final.head(20))
            else:
                print("No se encontró ningún archivo de reloj.")
        else:
            print("No se encontró ningún archivo asignado.")
    else:
        print("No se encontró ningún archivo de horarios.")


def main():
    df = obtener_df()
    print('SEPARACION')
    print(df.head(20))


if __name__ == '__main__':
    main()

