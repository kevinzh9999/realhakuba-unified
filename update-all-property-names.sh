#!/bin/bash

echo "🔄 开始更新所有物业名称引用..."

# 更新所有 TypeScript, JavaScript, JSON 文件
find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" \) -print0 | while IFS= read -r -d '' file; do
  # 创建临时文件
  temp_file="${file}.tmp"
  
  # 执行替换
  sed -e "s/echovilla/echo-villa/g" \
      -e "s/moyaihouse/moyai-house/g" \
      -e "s/riversideloghouse/riverside-loghouse/g" \
      -e "s/riverside-log-house/riverside-loghouse/g" \
      "$file" > "$temp_file"
  
  # 检查是否有变化
  if ! cmp -s "$file" "$temp_file"; then
    mv "$temp_file" "$file"
    echo "✅ 更新: $file"
  else
    rm "$temp_file"
  fi
done

echo "✅ 所有文件更新完成！"
