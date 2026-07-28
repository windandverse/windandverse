/// <reference path="../.astro/types.d.ts" />

declare module '/pagefind/pagefind-ui.js' {
    export class PagefindUI {
        constructor(options: { 
            element: string; 
            showImages?: boolean; 
            excerptLength?: number; 
            resetStyles?: boolean 
        });
    }
}