require 'pry'

# sample
def convert(input)
  lines = input.split("\n")

  data = {}
  prev_line = nil
  output = ''
  lines.each_with_index do |line, index|
    parent = search_parent(prev_line, data, line)
    m = line.match(/^( *)\* (.*)/)
    data[index] = { index: index, content: m[2], parent: parent, original: line, nest: m[1].length, children: [] }
    prev_line = data[index]
    data[parent][:children] = data[parent][:children] + [index] unless parent.nil?
  end

  prev_line = nil
  data.each do |_index, line|
    next unless line[:parent].nil?

    output += "describe \"#{line[:content]}\"\n"
    output = children_blocks(line, data, output)
    output += "end\n"
  end
  output
end

def children_blocks(line, data, output)
  line[:children].each do |child_index|
    child = data[child_index]
    if child[:children] == []
      output += "#{' ' * child[:nest]}it \"#{child[:content]}\" do\n#{' ' * child[:nest]}end\n"
    else
      output += "#{' ' * child[:nest]}context \"#{child[:content]}\" do\n"
      output = children_blocks(child, data, output)
      output += "#{' ' * child[:nest]}end\n"
    end
  end
  output
end

def search_parent(prev_line, data, line)
  m = line.match(/^( *)\* (.*)/)
  return nil if m[1].length.zero?

  if prev_line[:nest] == m[1].length
    prev_line[:parent]
  elsif prev_line[:nest] < m[1].length
    prev_line[:index]
  else # prev_line[:nest] > m[1].length
    search_parent(data[prev_line[:parent]], data, prev_line[:original])
  end
end

input = "* #push\n  * When push a string\n    * Return pushed string\n  * When push nil\n    * Raise ArgumentError\n* #pop\n  * When pop a string\n    * Return popped string\n  * When pop nil\n    * Raise ArgumentError\n    * return 'aaa'"
output = convert(input)
puts output
