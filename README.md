# Property Booking System

## 项目概述

本项目是一个酒店预订系统，集成了 Stripe 支付和 Beds24 房态管理。

在http://admin.localhost:3000/en/review-scraper
通过调用api/scraper/review 可以读取airbnb的review
通过调用api/reviews/save 存入src/data/reviews/[propname].json
数据可能需要人工清洗


```mermaid
graph TD
    A[客人提交预订] --> B{30天内?}
    B -->|是| C[immediate + request状态]
    B -->|否| D[scheduled + request状态]
    
    C --> E[人工审核]
    D --> E[人工审核]
    
    E -->|批准| F[approved_for_charge=true<br/>status→pending]
    E -->|拒绝| G[status→cancelled<br/>发送拒绝邮件]
    
    F --> H{charge_method?}
    H -->|immediate| I[显示在手动扣款页面]
    H -->|scheduled| J[等待到期自动扣款]
    
    G --> K[更新Beds24为cancelled]
    G --> L[释放Stripe支付方式]
    
    I --> M[管理员点击扣款]
    J --> N[定时任务自动扣款]
    
    M --> O[支付成功]
    N --> O[支付成功]
    
    O --> P[status→paid]
    O --> Q[更新Beds24为confirmed]