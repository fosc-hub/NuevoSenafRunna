# Debugging Localization Refactor

## What I Changed

I've cleared the Next.js cache and added comprehensive debugging to track the API calls.

## Steps to Verify the Refactor

### 1. Restart Your Development Server

Since I cleared the `.next` cache, you need to restart your dev server:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

### 2. Open Browser DevTools

1. Open Chrome DevTools (F12)
2. Open **both** tabs:
   - **Console** tab (for debug messages)
   - **Network** tab (for API calls)

### 3. Clear Previous Data

In DevTools:
- Console tab: Click the "Clear console" icon
- Network tab: Click the "Clear" icon (trash can)

### 4. Navigate to a Legajo

Go to any legajo detail page (e.g., `/legajo/22`)

### 5. Check Console for Debug Messages

You should see messages like:

```
🔍 LocalizacionSection REFACTORED rendering with personaId: 35
🔍 Full legajoData: {...}
🔍 usePersonaLocalizacion called with personaId: 35 enabled: true
🔍 usePersonaLocalizacion queryFn executing for personaId: 35
🚀 API CALL: Fetching localizacion for persona 35 from /api/localizacion-persona/35/
```

**If you DON'T see "REFACTORED":**
- The old component is still being loaded
- Try hard refresh: Ctrl+Shift+R
- Verify dev server restarted properly

**If you see "REFACTORED" but no API call:**
- Check if `personaId` is undefined/null in the logs
- The hook might be disabled due to missing persona ID

### 6. Check Network Tab

You should see these NEW calls:

```
✅ GET /api/localizacion-persona/35/
✅ GET /api/legajos/22/
```

You should NOT see:

```
❌ GET /api/registro-demanda-form/{id}/full-detail/
```

(Unless the direct endpoint returns 404, then fallback will kick in)

### 7. Expected Console Output Patterns

#### Success Case:
```
🔍 LocalizacionSection REFACTORED rendering with personaId: 35
🔍 usePersonaLocalizacion called with personaId: 35 enabled: true
🔍 usePersonaLocalizacion queryFn executing for personaId: 35
🚀 API CALL: Fetching localizacion for persona 35 from /api/localizacion-persona/35/
✅ API RESPONSE: Localizacion data received: {...}
🔍 usePersonaLocalizacion results: { localizacion: {...}, isLoading: false, error: null }
```

#### 404 Fallback Case:
```
🔍 LocalizacionSection REFACTORED rendering with personaId: 35
🔍 usePersonaLocalizacion called with personaId: 35 enabled: true
🔍 usePersonaLocalizacion queryFn executing for personaId: 35
🚀 API CALL: Fetching localizacion for persona 35 from /api/localizacion-persona/35/
❌ API ERROR: Failed to fetch persona localizacion 35: ...
ℹ️ 404 Not Found - Localizacion endpoint not available for persona 35
🔍 usePersonaLocalizacion results: { localizacion: null, isLoading: false, error: null }
```

(In 404 case, component will fall back to `legajoData.localizacion_actual.localizacion`)

#### Missing Persona ID Case:
```
🔍 LocalizacionSection REFACTORED rendering with personaId: undefined
🔍 usePersonaLocalizacion called with personaId: undefined enabled: false
🔍 usePersonaLocalizacion results: { localizacion: undefined, isLoading: false, error: null }
```

(Hook is disabled, will show "No hay información de localización registrada")

## Troubleshooting

### Issue: Still seeing "Ubicación: N/A"

**Check Console:**
1. Do you see "REFACTORED" in the logs?
   - **NO** → Old component still loaded. Hard refresh (Ctrl+Shift+R)
   - **YES** → Continue to next step

2. Is `personaId` present in logs?
   - **undefined/null** → Check legajo API response, persona data might be missing
   - **Has value** → Continue to next step

3. Is the API call being made?
   - **NO** → Hook might be disabled, check console for "enabled: false"
   - **YES** → Check API response

4. Does API return data?
   - **404 Error** → Backend endpoint not implemented yet (expected, will use fallback)
   - **Other Error** → Check error message, might be authentication or CORS issue
   - **Returns data** → Check if `response.localizacion` exists

### Issue: Old component still loading

```bash
# Hard refresh browser: Ctrl+Shift+R
# If that doesn't work, clear all Next.js cache again:
rm -rf .next
npm run dev
```

### Issue: "enabled: false" in console

The hook is disabled because `personaId` is missing. Check:
1. Is `legajoData.persona.id` present?
2. Check the legajo API response: `/api/legajos/{id}/`

### Issue: API call made but returns 404

This is **expected** if the backend hasn't implemented the direct endpoints yet.

The component will fall back to `legajoData.localizacion_actual.localizacion` from the main legajo API.

**To verify fallback works:**
1. Check if `legajoData.localizacion_actual.localizacion` exists in console
2. The address should display from fallback data
3. You won't get the performance benefit until backend implements the endpoint

## Success Criteria

✅ Console shows "REFACTORED" in logs
✅ `personaId` is present in logs
✅ Hook is enabled (enabled: true)
✅ API call is made to `/api/localizacion-persona/{id}/`
✅ Network tab shows the new API call
✅ Address displays correctly (either from new API or fallback)

## Performance Verification

If the backend endpoint IS implemented:

**Before (OLD):**
- Network tab shows: `GET /api/registro-demanda-form/{id}/full-detail/`
- Size: ~150KB
- Time: ~800ms

**After (NEW):**
- Network tab shows: `GET /api/localizacion-persona/{id}/`
- Size: ~2KB
- Time: ~150ms
- **Improvement: 98.6% smaller, 81% faster**

## Next Steps

1. **Restart dev server** and navigate to legajo
2. **Share console output** with me if you see any issues
3. **Share Network tab screenshot** showing the API calls
4. If everything works, we can remove the debug console.logs
