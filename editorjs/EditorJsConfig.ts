;
// @ts-expect-error TODO
import editorjsColumns from '@calumk/editorjs-columns';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import ImageTool from '@editorjs/image';
import Table from '@editorjs/table';
// @ts-expect-error TODO
import ColorPlugin from 'editorjs-text-color-plugin';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { uid } from 'quasar';
import { LinkTool2 } from 'src/notes/editorjs/linkTool';
import FirebaseServices from 'src/services/firebase/FirebaseServices';
import { useAuthStore } from 'stores/authStore';


class EditorJsConfig {
  private imageConfig = {
    class: ImageTool,
    config: {
      uploader: {
        // https://stackoverflow.com/questions/63610441/how-to-upload-image-to-firebase-storage-for-editor-js
        async uploadByFile(file: any) {
          console.log('got file', file)
          const storageRef = ref(
            FirebaseServices.getStorage(),
            `users/${useAuthStore().user.uid}/notes/images/${uid()}`,
          )
          const sn = await uploadBytes(storageRef, file)
          const downloadUrl = await getDownloadURL(sn.ref)
          console.log('Uploaded successfully!', sn, downloadUrl)
          return {
            success: 1,
            file: {
              url: downloadUrl,
            },
          }
        },

        uploadByUrl(url: string) {},
      },
    },
  }

  column_tools = {
    header: Header,
    linkTool2: {
      class: LinkTool2,
      config: {
        endpoint: `/www/editor.html`, // Your backend endpoint for url data fetching,
      },
    },
    //alert : Alert,
    //paragraph : editorjsParagraphLinebreakable,
    //delimiter : Delimiter
  }

  toolsconfigLocal = {}

  toolsconfig = {
    header: {
      class: Header,
      //         shortcut: "CMD+SHIFT+H"
    },
    // quote: {
    //     class: Quote,
    //     inlineToolbar: true,
    //     shortcut: 'CMD+SHIFT+O',
    //     config: {
    //         quotePlaceholder: 'Enter a quote',
    //         captionPlaceholder: 'Quote\'s author',
    //     }
    // },
    linkTool2: {
      class: LinkTool2,
      config: {
        endpoint: `/www/editor.html`, // Your backend endpoint for url data fetching,
      },
    },
    table: {
      class: Table,
      inlineToolbar: true,
      config: {
        rows: 2,
        cols: 3,
      },
    },
    columns: {
      class: editorjsColumns,
      config: {
        EditorJsLibrary: EditorJS,
        tools: this.column_tools,
      },
    },
    //      alert: Alert,
    image: this.imageConfig,
    Color: {
      class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
      config: {
        colorCollections: [
          '#EC7878',
          '#9C27B0',
          '#673AB7',
          '#3F51B5',
          '#0070FF',
          '#03A9F4',
          '#00BCD4',
          '#4CAF50',
          '#8BC34A',
          '#CDDC39',
          '#FFF',
        ],
        defaultColor: '#FF1300',
        type: 'text',
        customPicker: true, // add a button to allow selecting any colour
      },
    },
    Marker: {
      class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
      config: {
        defaultColor: '#FFBF00',
        type: 'marker',
        icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`,
      },
    },
    // tsimage: {
    //   class: ThumbnailFromTabs,
    //   inlineToolbar: true,
    //   config: {
    //     placeholder: 'Paste image URL'
    //   }
    // }
  }
}

export default new EditorJsConfig()
