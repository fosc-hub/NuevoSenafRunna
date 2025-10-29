# 🧪 Guía de Prueba - Campo `tipo_medida_evaluado`

## ✅ Pre-requisitos
- Tener acceso a la aplicación como **técnico** (no director)
- Tener una demanda con al menos un NNyA registrado
- Navegar a la página de evaluación con `?id=XXX`

## 📋 Casos de Prueba

### Caso 1: Validación de Campo Obligatorio ⚠️

**Pasos:**
1. Navegar a una evaluación
2. Scroll hasta el final de la página (botones de acción)
3. Seleccionar al menos un NNyA del dropdown "Seleccionar NNyA"
4. **NO** seleccionar ningún "Tipo de Medida"
5. Hacer clic en "Autorizar tomar medida"

**Resultado Esperado:**
- ❌ El botón debe estar DESHABILITADO (gris)
- Si intentas hacer clic, no debe pasar nada

---

### Caso 2: Flujo Exitoso de Tomar Medida ✅

**Pasos:**
1. Navegar a una evaluación
2. Scroll hasta el final de la página
3. Seleccionar al menos un NNyA del dropdown "Seleccionar NNyA"
4. Seleccionar "MPE" (Medida de Protección Excepcional) del dropdown "Tipo de Medida *"
5. Hacer clic en "Autorizar tomar medida"

**Resultado Esperado:**
- ✅ El botón debe estar HABILITADO (azul/activo)
- ✅ Debe mostrar toast de éxito: "Solicitud de tomar medida enviada exitosamente"
- ✅ Verificar en Network tab (DevTools) que el payload incluye:
  ```json
  {
    "tipo_medida_evaluado": "MPE",
    "solicitud_tecnico": "TOMAR MEDIDA",
    ...
  }
  ```

---

### Caso 3: Verificar Opciones del Dropdown 📋

**Pasos:**
1. Navegar a una evaluación
2. Hacer clic en el dropdown "Tipo de Medida *"

**Resultado Esperado:**
- ✅ Debe mostrar exactamente 3 opciones:
  1. "Medida de Protección Integral (MPI)"
  2. "Medida de Protección Excepcional (MPE)"
  3. "Medida Penal Juvenil (MPJ)"

---

### Caso 4: Campo NO aparece para "Autorizar Archivar" 🗑️

**Pasos:**
1. Navegar a una evaluación
2. Hacer clic en "Autorizar archivar"

**Resultado Esperado:**
- ✅ La solicitud debe enviarse SIN el campo `tipo_medida_evaluado`
- ✅ Verificar en Network tab que el payload NO incluye `tipo_medida_evaluado`

---

### Caso 5: Campo NO aparece para Directores 👔

**Pre-requisito:** Acceder como director/superuser

**Pasos:**
1. Navegar a una evaluación como director
2. Scroll hasta los botones de acción

**Resultado Esperado:**
- ✅ NO debe verse el dropdown "Tipo de Medida"
- ✅ Solo deben verse los botones "Autorizar" y "No Autorizar"

---

### Caso 6: Validación con Toast Warning ⚠️

**Pasos:**
1. Navegar a una evaluación
2. Seleccionar al menos un NNyA
3. Dejar vacío el campo "Tipo de Medida"
4. Usar JavaScript console para forzar el botón:
   ```javascript
   document.querySelector('button[disabled]').disabled = false
   ```
5. Hacer clic en el botón ahora habilitado

**Resultado Esperado:**
- ⚠️ Debe mostrar toast warning: "Por favor seleccione el tipo de medida a tomar"
- ❌ NO debe enviar la solicitud

---

## 🎯 Checklist Visual Rápido

En la interfaz de evaluación (como técnico), debería verse algo así:

```
┌─────────────────────────────────────────────────────┐
│  [Descargar PDF ▼]  [Firmantes ▼]                   │
│                                                     │
│  [Autorizar archivar]                               │
│                                                     │
│  [Seleccionar NNyA ▼] (debe tener al menos 1)       │
│                                                     │
│  [Tipo de Medida * ▼] (nuevo campo - 3 opciones)    │
│                                                     │
│  [Autorizar tomar medida] (habilitado solo si       │
│                            ambos campos completos)  │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Validación en DevTools

### Network Request a verificar:

**Endpoint:** `POST /api/evaluaciones/`

**Request Body debe incluir:**
```json
{
  "nnyas_evaluados_id": [123],
  "descripcion_de_la_situacion": "...",
  "valoracion_profesional_final": "...",
  "justificacion_tecnico": "...",
  "solicitud_tecnico": "TOMAR MEDIDA",
  "tipo_medida_evaluado": "MPI",  // ← VERIFICAR ESTE CAMPO
  "demanda": 456,
  "localidad_usuario": "...",
  "nombre_usuario": "...",
  "rol_usuario": "..."
}
```

---

## 🐛 Posibles Errores y Soluciones

### Error: Botón siempre deshabilitado
**Causa:** No se seleccionó NNyA o tipo de medida
**Solución:** Verificar que ambos dropdowns tengan valores seleccionados

### Error: Campo no aparece
**Causa:** Usuario es director/superuser
**Solución:** Acceder con cuenta de técnico

### Error: Backend rechaza el request
**Causa:** Backend aún no actualizado o campo mal formado
**Solución:** Verificar que el backend tenga el campo `tipo_medida_evaluado` en el serializer

---

## ✅ Prueba Completa Exitosa

Si todos estos puntos funcionan, la implementación está correcta:

- [ ] Dropdown visible para técnicos
- [ ] Dropdown NO visible para directores
- [ ] 3 opciones disponibles (MPI, MPE, MPJ)
- [ ] Botón deshabilitado sin selección
- [ ] Toast warning si se intenta enviar sin selección
- [ ] Campo incluido en payload cuando solicitud_tecnico = "TOMAR MEDIDA"
- [ ] Campo NO incluido cuando solicitud_tecnico = "ARCHIVAR"
- [ ] Request exitoso al backend

---

**Última actualización:** 29 de octubre, 2025
**Implementado en:** `src/components/evaluacion/action-buttons.tsx`

