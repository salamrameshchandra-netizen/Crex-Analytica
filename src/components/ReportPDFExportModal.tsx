import { useState } from 'react';
import { Player } from '../types';
import { FileDown, Printer, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ReportPDFExportModalProps {
  player: Player;
  selectedSeason: string;
  onClose: () => void;
}

export default function ReportPDFExportModal({ player, selectedSeason, onClose }: ReportPDFExportModalProps) {
  const [exportType, setExportType] = useState<'single' | 'multipage'>('single');
  const [paperFormat, setPaperFormat] = useState<'a4' | 'letter'>('a4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Helper to parse individual oklch/oklab color strings into a readable fallback hex/rgb representation
  const parseOklchToRgb = (str: string): string => {
    try {
      // strip standard units if any, like percentage signs
      const normalized = str.replace(/%/g, '');
      
      // Look for up to 4 values: L, C, H and optional visual alpha channel separated by / or comma
      const match = normalized.match(/okl(ch|ab)\s*\(\s*([\d.-]+)[\s,]+([\d.-]+)[\s,]+([\d.-]+)(?:\s*[\/,]+\s*([\d.-]+))?\s*\)/i);
      if (!match) {
        return '#0f172a'; // fallback to dark theme blue-slate as base
      }
      
      let l = parseFloat(match[2]);
      let c = parseFloat(match[3]);
      let h = parseFloat(match[4]);
      let a = match[5] ? parseFloat(match[5]) : 1;

      // Scale L down if it's from percentage representation
      if (str.includes('%') && l > 1) {
        l = l / 100;
      } else if (l > 1) {
        l = l / 100;
      }
      
      // Scale alpha down if it's from percentage representation
      if (match[5] && str.includes('%') && a > 1) {
        a = a / 100;
      } else if (match[5] && a > 1) {
        a = a / 100;
      }

      // Keep safe boundaries
      l = Math.max(0, Math.min(1, l));
      c = Math.max(0, Math.min(0.4, c));
      h = ((h % 360) + 360) % 360;
      a = Math.max(0, Math.min(1, a));

      // OKLCH to sRGB math:
      const hRad = (h * Math.PI) / 180;
      const a_ = c * Math.cos(hRad);
      const b_ = c * Math.sin(hRad);

      const l_ = l + 0.3963377774 * a_ + 0.2158037573 * b_;
      const m_ = l - 0.1055613458 * a_ - 0.0638541728 * b_;
      const s_ = l - 0.0894841775 * a_ - 1.2914855414 * b_;

      const l3 = l_ * l_ * l_;
      const m3 = m_ * m_ * m_;
      const s3 = s_ * s_ * s_;

      const rL = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
      const gL = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
      const bL = -0.0041960863 * l3 - 0.7034186149 * m3 + 1.7076147012 * s3;

      const toSRGB = (x: number) => {
        const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055;
        return Math.max(0, Math.min(255, Math.round(v * 255)));
      };

      const r = toSRGB(rL);
      const g = toSRGB(gL);
      const b = toSRGB(bL);

      if (a < 1) {
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    } catch (e) {
      return '#0f172a';
    }
  };

  // Helper to replace oklch and oklab with standard rgb/rgba fallbacks inside CSS strings
  const replaceOklchOklab = (str: string): string => {
    if (!str) return str;
    let res = str;
    let idx = -1;
    // Walk through occurrences of oklch( or oklab( and balance the brackets
    while ((idx = res.search(/okl(ch|ab)\s*\(/i)) !== -1) {
      let openBrackets = 1;
      let endIdx = idx + 6; // 'oklch(' is 6, 'oklab(' is 6
      while (endIdx < res.length && openBrackets > 0) {
        if (res[endIdx] === '(') {
          openBrackets++;
        } else if (res[endIdx] === ')') {
          openBrackets--;
        }
        endIdx++;
      }
      const matched = res.substring(idx, endIdx);
      const replacement = parseOklchToRgb(matched);
      res = res.substring(0, idx) + replacement + res.substring(endIdx);
    }
    return res;
  };

  // Safe wrapper for html2canvas to exclude modern Tailwind v4 oklab/oklch declarations, which crash its CSS parser
  const safeHtml2Canvas = async (elem: HTMLElement, renderOptions: any) => {
    // 1. Temporarily replace style contents of active style tags in the main document to ensure html2canvas's own CSS parser reads them successfully
    const styleTags = Array.from(document.querySelectorAll('style'));
    const originalStylesMap = new Map<HTMLStyleElement, string>();

    try {
      for (const tag of styleTags) {
        originalStylesMap.set(tag, tag.innerHTML);
        tag.innerHTML = replaceOklchOklab(tag.innerHTML);
      }
    } catch (e) {
      console.warn('Failed to preprocess main document styles:', e);
    }

    // 2. Intercept window getComputedStyle for the main window
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function(el: Element, pseudoElt?: string | null) {
      const style = originalGetComputedStyle.call(this, el, pseudoElt);
      return new Proxy(style, {
        get(target, prop) {
          const value = (target as any)[prop];
          if (typeof value === 'string') {
            if (value.includes('oklch') || value.includes('oklab')) {
              return replaceOklchOklab(value);
            }
          }
          if (typeof value === 'function') {
            return function(this: any, ...args: any[]) {
              const res = (value as any).apply(target, args);
              if (typeof res === 'string' && (res.includes('oklch') || res.includes('oklab'))) {
                return replaceOklchOklab(res);
              }
              return res;
            }.bind(target as any);
          }
          return value;
        }
      });
    };

    // 3. Add an onclone hook to clean cloned sheets and inline style tags inside the cloned iframe
    const originalOnClone = renderOptions.onclone;
    renderOptions.onclone = (clonedDoc: Document, clonedElem: HTMLElement) => {
      try {
        // Intercept getComputedStyle in the iframe where html2canvas actually queries computed properties
        const clonedWin = clonedDoc.defaultView;
        if (clonedWin) {
          const originalClonedGetComputedStyle = clonedWin.getComputedStyle;
          clonedWin.getComputedStyle = function(el: Element, pseudoElt?: string | null) {
            const style = originalClonedGetComputedStyle.call(this, el, pseudoElt);
            return new Proxy(style, {
              get(target, prop) {
                const value = (target as any)[prop];
                if (typeof value === 'string') {
                  if (value.includes('oklch') || value.includes('oklab')) {
                    return replaceOklchOklab(value);
                  }
                }
                if (typeof value === 'function') {
                  return function(this: any, ...args: any[]) {
                    const res = (value as any).apply(target, args);
                    if (typeof res === 'string' && (res.includes('oklch') || res.includes('oklab'))) {
                      return replaceOklchOklab(res);
                    }
                    return res;
                  }.bind(target as any);
                }
                return value;
              }
            });
          };
        }

        const clonedStyles = Array.from(clonedDoc.querySelectorAll('style'));
        for (const tag of clonedStyles) {
          tag.innerHTML = replaceOklchOklab(tag.innerHTML);
        }
        
        const elementsWithStyle = Array.from(clonedDoc.querySelectorAll('[style]'));
        for (const el of elementsWithStyle) {
          const styleAttr = el.getAttribute('style');
          if (styleAttr && (styleAttr.toLowerCase().includes('oklch') || styleAttr.toLowerCase().includes('oklab'))) {
            el.setAttribute('style', replaceOklchOklab(styleAttr));
          }
        }
      } catch (e) {
        console.warn('Failed during cloned window style cleaning:', e);
      }

      if (originalOnClone) {
        originalOnClone(clonedDoc, clonedElem);
      }
    };

    // 4. Fallback: Define the proxy getters on CSSStyleSheet prototype as safety net
    if (typeof window === 'undefined' || typeof CSSStyleSheet === 'undefined') {
      try {
        return await html2canvas(elem, renderOptions);
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
        for (const [tag, originalHtml] of originalStylesMap.entries()) {
          try {
            tag.innerHTML = originalHtml;
          } catch (e) { /* ignore */ }
        }
      }
    }

    const originalCssRules = Object.getOwnPropertyDescriptor(CSSStyleSheet.prototype, 'cssRules');
    const originalRules = Object.getOwnPropertyDescriptor(CSSStyleSheet.prototype, 'rules');

    const proxyGetter = function(this: CSSStyleSheet) {
      try {
        const rules = originalCssRules?.get ? originalCssRules.get.call(this) : (this as any).rules;
        if (!rules) return rules;

        return new Proxy(rules, {
          get(target, prop) {
            if (prop === 'length') {
              return target.length;
            }
            if (typeof prop === 'string' && !isNaN(Number(prop))) {
              const rule = target[Number(prop)];
              if (!rule) return rule;

              return new Proxy(rule, {
                get(ruleTarget, ruleProp) {
                  if (ruleProp === 'cssText') {
                    const text = ruleTarget.cssText;
                    if (text && (text.includes('oklab') || text.includes('oklch'))) {
                      return replaceOklchOklab(text);
                    }
                    return text;
                  }

                  if (ruleProp === 'cssRules' || ruleProp === 'rules') {
                    const subRules = (ruleTarget as any)[ruleProp];
                    if (!subRules) return subRules;
                    return new Proxy(subRules, {
                      get(subTarget, subProp) {
                        if (subProp === 'length') return subTarget.length;
                        if (typeof subProp === 'string' && !isNaN(Number(subProp))) {
                          const subRule = subTarget[Number(subProp)];
                          if (!subRule) return subRule;
                          return new Proxy(subRule, {
                            get(subRuleTarget, subRuleProp) {
                              if (subRuleProp === 'cssText') {
                                const subText = subRuleTarget.cssText;
                                if (subText && (subText.includes('oklab') || subText.includes('oklch'))) {
                                  return replaceOklchOklab(subText);
                                }
                                return subText;
                              }
                              const val = (subRuleTarget as any)[subRuleProp];
                              return typeof val === 'function' ? val.bind(subRuleTarget) : val;
                            }
                          });
                        }
                        const val = subTarget[subProp as any];
                        return typeof val === 'function' ? val.bind(subTarget) : val;
                      }
                    });
                  }

                  if (ruleProp === 'style') {
                    const style = ruleTarget.style;
                    if (style) {
                      return new Proxy(style, {
                        get(styleTarget, styleProp) {
                          const val = styleTarget[styleProp as keyof CSSStyleDeclaration];
                          if (typeof val === 'string' && (val.includes('oklab') || val.includes('oklch'))) {
                            return replaceOklchOklab(val);
                          }
                          return val;
                        }
                      });
                    }
                  }

                  const value = (ruleTarget as any)[ruleProp];
                  if (typeof value === 'function') {
                    return value.bind(ruleTarget);
                  }
                  return value;
                }
              });
            }
            const value = (target as any)[prop];
            if (typeof value === 'function') {
              return value.bind(target);
            }
            return value;
          }
        });
      } catch (e) {
        return [];
      }
    };

    if (originalCssRules) {
      Object.defineProperty(CSSStyleSheet.prototype, 'cssRules', {
        get: proxyGetter,
        configurable: true,
      });
    }
    if (originalRules) {
      Object.defineProperty(CSSStyleSheet.prototype, 'rules', {
        get: proxyGetter,
        configurable: true,
      });
    }

    try {
      const canvas = await html2canvas(elem, renderOptions);
      return canvas;
    } finally {
      if (originalCssRules) {
        Object.defineProperty(CSSStyleSheet.prototype, 'cssRules', originalCssRules);
      }
      if (originalRules) {
        Object.defineProperty(CSSStyleSheet.prototype, 'rules', originalRules);
      }
      
      // Restore getComputedStyle
      window.getComputedStyle = originalGetComputedStyle;

      // Restore styles in main document
      for (const [tag, originalHtml] of originalStylesMap.entries()) {
        try {
          tag.innerHTML = originalHtml;
        } catch (e) {
          // ignore
        }
      }
    }
  };

  const handleExportPDF = async () => {
    setIsGenerating(true);
    setErrorText(null);
    setProgressMessage('Locating dashboard elements in DOM...');

    try {
      // Find the target element. 
      // We wrap the right panel inside the id 'athlete-report-content'.
      const element = document.getElementById('athlete-report-content');
      if (!element) {
        throw new Error('Dashboard panel could not be localized. Please try again.');
      }

      // Small delay to let any rendering/animations settle
      setProgressMessage('Adjusting vector charts for high resolution...');
      await new Promise((resolve) => setTimeout(resolve, 600));

      setProgressMessage('Rendering canvas at 2x crisp scale...');
      
      const canvas = await safeHtml2Canvas(element, {
        scale: 2, // 2x scale for print sharpness
        useCORS: true, // Allow fetching avatar images
        logging: false,
        backgroundColor: '#020617', // Match slate-950 theme background color exactly
        ignoreElements: (el: HTMLElement) => {
          // Ignore action buttons or specific elements you don't want in print
          return el.classList.contains('no-pdf-export') || el.id === 'record-btn';
        }
      });

      setProgressMessage('Generating PDF artifact pages...');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate sizes
      const contentWidth = canvas.width;
      const contentHeight = canvas.height;

      // Create JS PDF
      // A4 dimensions: 210mm x 297mm
      // Letter dimensions: 215.9mm x 279.4mm
      const pageWidth = paperFormat === 'a4' ? 210 : 215.9;
      const pageHeight = paperFormat === 'a4' ? 297 : 279.4;

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: paperFormat,
      });

      if (exportType === 'single') {
        setProgressMessage('Compiling into Single-Page Executive Brief...');
        // In "single" mode, we stretch or scale to fit the exact width of page and dynamically size the height
        const imgWidth = pageWidth - 20; // 10mm margins on left/right
        const ratio = contentHeight / contentWidth;
        const imgHeight = imgWidth * ratio;

        // Add title and logo
        pdf.setFillColor(15, 23, 42); // slate-900 background for a header block
        pdf.rect(0, 0, pageWidth, 28, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(16, 185, 129); // emerald-500
        pdf.text('ATHLEDEX CRICKET LABORATORIES', 10, 11);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139); // slate-500
        pdf.text(`OFFICIAL ANALYTICS PORTFOLIO | EXTRACTED: ${new Date().toLocaleDateString()}`, 10, 16);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`SUBJECT: ${player.name.toUpperCase()} PERFORMANCE LEDGER`, 10, 23);

        pdf.addImage(imgData, 'PNG', 10, 32, imgWidth, imgHeight);
        
        // Dynamic Footer
        pdf.setFillColor(2, 6, 23);
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Verified Athletic Snapshot. Local Sandbox Records Synchronized.`, 10, pageHeight - 8);
      } else {
        setProgressMessage('Compiling into Multi-Page Deep-Dive Dossier...');
        
        // Multi-page slicing using canvas chunks or scaling
        // Calculate how many vertical sections we need to slice
        const pxPageHeight = (contentWidth / (pageWidth - 20)) * (pageHeight - 45); // convert mm back to pixel ratio
        let heightLeft = contentHeight;
        let position = 32; // initial printing Y position from top
        let pageNum = 1;

        while (heightLeft > 0) {
          if (pageNum > 1) {
            pdf.addPage();
            position = 15; // secondary page starts with less top margin
          }

          // Top Header for each page
          pdf.setFillColor(15, 23, 42);
          pdf.rect(0, 0, pageWidth, 12, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          pdf.setTextColor(16, 185, 129);
          pdf.text(`ATHLEDEX REPORT: ${player.name.toUpperCase()} (${player.role})`, 10, 7);
          pdf.text(`PAGE ${pageNum}`, pageWidth - 20, 7);

          // Add visual slice
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = contentWidth;
          sliceCanvas.height = Math.min(pxPageHeight, heightLeft);
          const sliceCtx = sliceCanvas.getContext('2d');
          
          if (sliceCtx) {
            sliceCtx.drawImage(
              canvas,
              0, contentHeight - heightLeft, // source Y
              contentWidth, Math.min(pxPageHeight, heightLeft), // source dimensions
              0, 0, // canvas dest coordinates
              contentWidth, Math.min(pxPageHeight, heightLeft) // canvas dest dimension
            );

            const sliceImgData = sliceCanvas.toDataURL('image/png');
            const imgWidth = pageWidth - 20;
            const imgHeight = (Math.min(pxPageHeight, heightLeft) / contentWidth) * imgWidth;
            
            pdf.addImage(sliceImgData, 'PNG', 10, position, imgWidth, imgHeight);
          }

          heightLeft -= pxPageHeight;
          pageNum++;
        }
      }

      const filename = `${player.name.toLowerCase().replace(/\s+/g, '_')}_performance_ledger.pdf`;
      pdf.save(filename);
      setIsSuccess(true);
      setProgressMessage('PDF Report exported successfully!');
      
      // Let success state hover for 1.8 seconds before modal closes
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);

    } catch (e: any) {
      console.error(e);
      setErrorText(e.message || 'An unexpected rendering index issue occurred during PDF compilation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect decorative */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-indigo-500"></div>

        <button 
          onClick={onClose}
          disabled={isGenerating}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-9 w-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/15">
            <FileDown className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider font-mono">Export Report Portfolio</h3>
            <p className="text-[10px] text-slate-500 font-mono leading-none">PDF GENERATION COMMAND BLOCK</p>
          </div>
        </div>

        {/* Content Block */}
        {!isGenerating && !isSuccess ? (
          <div className="space-y-5 text-left text-xs">
            {/* Brief info */}
            <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-2xl">
              <p className="text-slate-400 leading-normal text-[11px]">
                You are extracting the complete athletic performance dossier for <strong className="text-white">{player.name}</strong> ({selectedSeason === 'All' ? 'All Seasons' : `Season ${selectedSeason}`}). This compiles standard averages, historic matches ledger, and rolling charts.
              </p>
            </div>

            {/* Configs */}
            <div className="space-y-4">
              {/* Export Type Selection */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 font-mono uppercase tracking-widest mb-2">Export Layout Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportType('single')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                      exportType === 'single'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-850/50 text-slate-400'
                    }`}
                  >
                    <span className="font-extrabold text-[11px]">Executive Brief</span>
                    <span className="text-[9px] text-slate-500 leading-normal font-mono">Single formatted scroll summary</span>
                  </button>

                  <button
                    onClick={() => setExportType('multipage')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                      exportType === 'multipage'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-850/50 text-slate-400'
                    }`}
                  >
                    <span className="font-extrabold text-[11px]">Print Dossier</span>
                    <span className="text-[9px] text-slate-500 leading-normal font-mono">Multi-page scaled layout</span>
                  </button>
                </div>
              </div>

              {/* Page Format */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 font-mono uppercase tracking-widest mb-1.5">Paper Dimension</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 font-mono font-medium cursor-pointer">
                    <input 
                      type="radio" 
                      name="paper" 
                      checked={paperFormat === 'a4'} 
                      onChange={() => setPaperFormat('a4')} 
                      className="accent-emerald-500"
                    />
                    A4 (210 x 297mm)
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 font-mono font-medium cursor-pointer">
                    <input 
                      type="radio" 
                      name="paper" 
                      checked={paperFormat === 'letter'} 
                      onChange={() => setPaperFormat('letter')} 
                      className="accent-emerald-500"
                    />
                    Letter (8.5" x 11")
                  </label>
                </div>
              </div>
            </div>

            {/* Error display if any */}
            {errorText && (
              <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] leading-relaxed">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <p>{errorText}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-slate-850 hover:bg-slate-805 text-slate-300 font-bold border border-slate-800 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExportPDF}
                className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all hover:bg-emerald-400 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Export Now</span>
              </button>
            </div>
          </div>
        ) : isGenerating ? (
          /* Loading / Generating State */
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
            <div className="space-y-1 text-center">
              <h4 className="font-black text-xs text-slate-200 uppercase tracking-widest font-mono">Generating Portfolio...</h4>
              <p className="text-[10px] text-slate-500 font-mono px-6">{progressMessage}</p>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-scale-up">
            <div className="h-12 w-12 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1 text-center">
              <h4 className="font-black text-xs text-slate-200 uppercase tracking-widest font-mono">Export Triggered!</h4>
              <p className="text-[10px] text-slate-400 leading-normal">
                Files saved to download folder as:<br/>
                <strong className="text-emerald-400">{player.name.toLowerCase().replace(/\s+/g, '_')}_performance_ledger.pdf</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
