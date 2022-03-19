import { EmojiButton } from 'https://cdn.jsdelivr.net/npm/@joeattardi/emoji-button@4.6.0/dist/index.min.js';



window.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#emoji-button');
    const picker = new EmojiButton({

        // position of the emoji picker. Available positions:
        // auto-start, auto-end, top, top-start, top-end, right, right-start, right-end, bottom, bottom-start, bottom-end, left, left-start, left-end
        position: 'top',
    
        // 1.0, 2.0, 3,0, 4.0, 5.0, 11.0, 12.0, 12.1
        emojiVersion: '13.1',
    
        // root element
        rootElement: document.body,
    
        // enable animation
        showAnimation: true,
    
        // auto close the emoji picker after selection
        autoHide: true,
    
        // auto move focus to search field or not
        autoFocusSearch: true,
    
        // show the emoji preview
        showPreview: true,
    
        // show the emoji search input
        showSearch: true,
    
        // show recent emoji
        showRecents: true,
    
        // number of recent emoji
        recentsCount: 10,
    
        // show skin tone variants
        showVariants: true,
    
        // show category buttons
        showCategoryButtons: true,
    
        // or 'twemoji'
        style: 'twemoji',
    
        twemojiOptions: {
          ext: '.svg',
          folder: 'svg'
        },
    
        // 'light', 'drak', or 'auto'
        theme: 'light',
    
        // number of emojis per row
        emojisPerRow: 6,
    
        // number of rows
        rows: 5,
    
        // emoji size
        emojiSize: '28px',
    
        // maximum number of recent emojis to save
        recentsCount: 50,
    
        // initial category
        initialCategory: 'recents',
    
        // z-index property
        zIndex: 999,
    
        // an array of the categories to show
        categories: [
          'smileys',
          'people',
          'animals',
          'food',
          'activities',
          'travel',
          'objects',
          'symbols',
          'flags'
        ],
    
        // custom icons
        icons: {
          search: 'media/magnifier.png',
          clearSearch: 'media/cancel.png',
          notFound: 'media/page-not-found.png'
        },
    
        // i18n
        i18n: {
          search: 'Search',
          categories: {
            recents: 'Recently Used',
            smileys: 'Smileys & People',
            animals: 'Animals & Nature',
            food: 'Food & Drink',
            activities: 'Activities',
            travel: 'Travel & Places',
            objects: 'Objects',
            symbols: 'Symbols',
            flags: 'Flags'
          },
          notFound: 'No emojis found'
        }
    
    });
  
    picker.on('emoji', emoji => {
    //   console.log(emoji)
      document.querySelector('#chat-message-input').value += emoji.emoji;
    });
  
    button.addEventListener('click', () => {
      picker.pickerVisible ? picker.hidePicker() : picker.showPicker(button);
    });
  });