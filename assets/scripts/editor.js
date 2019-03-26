var app = new Vue({
  el: '#app',
  data: function () {
    return {
      title: 'Markdown to WeChat Article',
      aboutOutput: '',
      output: '',
      source: '',
      editorThemes: ['base16-light', 'monokai'],
      currentEditorTheme: 'base16-light',
      editor: null,
      builtinFonts: [
        { label: '衬线', value: 'serif', fonts: "Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif"},
        { label: '无衬线', value: 'sans-serif', fonts: "Roboto, Oxygen, Ubuntu, Cantarell, PingFangSC-light, PingFangTC-light, 'Open Sans', 'Helvetica Neue', sans-serif"}
      ],
      fontIndex : '0',
      currentFont : {},
      aboutDialogVisible: false
    }
  },
  mounted () {
    var self = this
    this.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
      lineNumbers: false,
      matchBrackets: true,
      lineWrapping: true,
      autocorrect:true,
      styleActiveLine: true,
      theme: this.currentEditorTheme,
      mode: 'text/x-markdown',
    });
    this.editor.setSize('auto','640px');
    this.editor.on("change", function(cm, change) {
      self.refresh()
    })
    this.currentFont = this.builtinFonts[0]
    this.wxRenderer = new WxRenderer({
      theme: defaultTheme,
      fonts: this.currentFont.fonts
    })
    axios({
      method: 'get',
      url: './assets/default-content.md',
    }).then(function (resp) {
      self.editor.setValue(resp.data)
    })
  },
  methods: {
    renderWeChat: function (source) {
      var output = marked(source, { renderer: this.wxRenderer.getRenderer() })
      if (this.wxRenderer.hasFootnotes()) {
        output += this.wxRenderer.buildFootnotes()
      }
      return output
    },
    themeChanged: function () {
      this.editor.setOption('theme', this.currentEditorTheme)
    },
    fontChanged: function (fonts) {
      this.currentFont = this.builtinFonts[this.fontIndex];
      console.log(this.fontIndex);

      this.wxRenderer.fonts = this.currentFont.fonts;
      console.log(this.wxRenderer.fonts);
      this.wxRenderer.setOptions({
        fonts: this.wxRenderer.fonts
      });
      this.refresh()
      console.log('do');
    },
    refresh: function () {
      this.output = this.renderWeChat(this.editor.getValue())
    },
    deleteContent : function () {
      this.editor.setValue('');
    },
    copy: function () {
      var clipboardDiv = document.getElementById('output')
      clipboardDiv.focus();
      window.getSelection().removeAllRanges();  
      var range = document.createRange(); 
      range.setStartBefore(clipboardDiv.firstChild);
      range.setEndAfter(clipboardDiv.lastChild);
      window.getSelection().addRange(range);  

      try {
        if (document.execCommand('copy')) {
          this.$message({
            message: '已复制到剪贴板,请到微信公众平台内粘贴', type: 'success'
          })
        } else {
          this.$message({
            message: '未能复制到剪贴板，请全选后右键复制', type: 'warning'
          })
        }
      } catch (err) {
        this.$message({
          message: '未能复制到剪贴板，请全选后右键复制', type: 'warning'
        })
      }
    }
  }
});

