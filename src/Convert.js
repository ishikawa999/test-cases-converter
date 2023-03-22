import React, { Component } from 'react';
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import CodeIcon from "@mui/icons-material/Code";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./Convert.css";

export class Convert extends Component {
  constructor(props) {
    super(props);

    this.state = {
      converted: "",
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.convertMarkdownToRspec = this.convertMarkdownToRspec.bind(this);
    this.parseMarkdownList = this.parseMarkdownList.bind();
    this.childrenBlocks = this.childrenBlocks.bind();
    this.searchParent = this.searchParent.bind();
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    this.setState({
      testCases: data.get("test-cases"),
    });
    this.convertMarkdownToRspec(event);
  }

  convertMarkdownToRspec(event) {
    const data = new FormData(event.currentTarget);
    const result = this.parseMarkdownList(data.get("test-cases"));
    this.setState({
      converted: result,
    });
  }

  parseMarkdownList = (input) => {
    const lines = input.split("\n");
    let data = {};
    let prevLine = null;
    let output = "";

    lines.forEach((line, index) => {
      let parent = this.searchParent(prevLine, data, line);
      let m = line.match(/^( *)(\*|-) (.*)/);
      data[index] = {
        index: index,
        content: m[3],
        parent: parent,
        original: line,
        nest: m[1].length,
        children: [],
      };
      prevLine = data[index];
      if (parent !== null) {
        data[parent].children.push(index);
      }
    });

    prevLine = null;
    Object.values(data).forEach((line) => {
      if (line.parent === null) {
        output += `describe "${line.content}" do\n`;
        output = this.childrenBlocks(line, data, output);
        output += "end\n";
      }
    });
    return output;
  };

  childrenBlocks = (line, data, output) => {
    line.children.forEach((childIndex) => {
      let child = data[childIndex];
      if (child.children.length === 0) {
        output += `${" ".repeat(child.nest)}it "${
          child.content
        }" do\n${" ".repeat(child.nest)}end\n`;
      } else {
        output += `${" ".repeat(child.nest)}context "${child.content}" do\n`;
        output = this.childrenBlocks(child, data, output);
        output += `${" ".repeat(child.nest)}end\n`;
      }
    });
    return output;
  };

  searchParent = (prevLine, data, line) => {
    let m = line.match(/^( *)(\*|-) (.*)/);

    if (m[1].length === 0) {
      return null;
    } else if (prevLine === null) {
      return null;
    } else if (prevLine.nest === m[1].length) {
      return prevLine.parent;
    } else if (prevLine.nest < m[1].length) {
      return prevLine.index;
    } else {
      return this.searchParent(data[prevLine.parent], data, line);
    }
  };

  render() {
    const theme = createTheme({
      typography: {
        button: {
          textTransform: "none"
        },
        root: {
          color: "#333333"
        }
      }
    });
    const testCasesDefailtVal =
      "* #push\n  * When push a string\n    * Return pushed string\n  * When push nil\n    * Raise ArgumentError\n* #hello\n  * Return hello";

    const textFieldStyle = {
      '& .MuiInputBase-input': {
        color: '#333333',    // 入力文字の色
      },
      '& label': {
        color: '333333', // 通常時のラベル色 
      },
      '& .MuiInput-underline:before': {
        borderBottomColor: '#cccccc', // 通常時のボーダー色
      },
      '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
        borderBottomColor: '#87CAAC',  // ホバー時のボーダー色
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#87CAAC',    // 通常時のボーダー色(アウトライン)
        },
        '&:hover fieldset': {
          borderColor: '#87CAAC',    // ホバー時のボーダー色(アウトライン)
        },
      },
    }
    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="lg">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <CodeIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Convert Markdown bulleted test cases to Rspec
            </Typography>
            <Box
              component="form"
              onSubmit={this.handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                id="test-cases"
                name="test-cases"
                label="Test cases(Markdown bullet points)"
                defaultValue={testCasesDefailtVal}
                InputLabelProps={{ shrink: true }}
                multiline
                sx={textFieldStyle}
                inputProps={{
                  cols: 150,
                }}
                maxRows={1000}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Convert to Rspec
              </Button>
              <TextField
                id="converted-test-cases"
                name="converted-test-cases"
                label="Test cases(Rspec)"
                defaultValue={this.state.converted}
                multiline
                sx={textFieldStyle}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  cols: 150,
                  readOnly: true
                }}
                maxRows={1000}
              />
            </Box>
            <Box id="footer">
              <Typography variant="body2" color="textSecondary" align="center">
                {"SorceCode "}
                <a href="https://github.com/ishikawa999/test-cases-converter">ishikawa999/test-cases-converter</a>{" "}
              </Typography>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }
}
