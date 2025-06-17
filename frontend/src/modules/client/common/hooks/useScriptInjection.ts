"use client";

import { useEffect } from 'react';
import { useScriptsBySection } from './useScript';
import { ScriptPosition, IScript } from '../services/script.service';

const injectScript = (script: IScript) => {
  const scriptElement = document.createElement('script');

  // Copy all content from the script
  scriptElement.innerHTML = script.content;

  // Extract src if present in the content
  const srcMatch = script.content.match(/src=["'](.*?)["']/);
  if (srcMatch) {
    scriptElement.src = srcMatch[1];
    scriptElement.innerHTML = ''; // Clear content if src is present
  }

  // Extract async and defer attributes if present
  if (script.content.includes('async')) {
    scriptElement.async = true;
  }
  if (script.content.includes('defer')) {
    scriptElement.defer = true;
  }

  return scriptElement;
};

const injectScripts = (scripts: IScript[], position: ScriptPosition) => {
  scripts.forEach((script) => {
    if (!script.isActive) return;

    const existingScript = document.querySelector(`script[data-script-id="${script._id}"]`);
    if (existingScript) return;

    const scriptElement = injectScript(script);
    scriptElement.setAttribute('data-script-id', script._id);

    switch (position) {
      case ScriptPosition.HEADER:
        document.head.appendChild(scriptElement);
        break;
      case ScriptPosition.MAIN:
        document.body.insertBefore(scriptElement, document.body.firstChild);
        break;
      case ScriptPosition.FOOTER:
        document.body.appendChild(scriptElement);
        break;
    }
  });
};

export const useScriptInjection = () => {
  const { data: scriptsBySection, isLoading, error } = useScriptsBySection();

  useEffect(() => {
    if (!scriptsBySection) return;

    // Inject scripts in the correct order
    injectScripts(scriptsBySection[ScriptPosition.HEADER], ScriptPosition.HEADER);
    injectScripts(scriptsBySection[ScriptPosition.MAIN], ScriptPosition.MAIN);
    injectScripts(scriptsBySection[ScriptPosition.FOOTER], ScriptPosition.FOOTER);

    // Cleanup function
    return () => {
      document.querySelectorAll('script[data-script-id]').forEach((script) => {
        script.remove();
      });
    };
  }, [scriptsBySection]);

  return { isLoading, error };
};